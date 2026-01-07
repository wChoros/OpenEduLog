import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// Enums
const roles = ['ADMIN', 'TEACHER', 'STUDENT'] as const
const weekDays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const

async function main() {
  // Clear existing data to avoid conflicts
  await prisma.usersOnMessages.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.message.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.grade.deleteMany()
  await prisma.timetable.deleteMany()
  await prisma.groupsOnSubjectsOnTeachers.deleteMany()
  await prisma.studentsOnGroups.deleteMany()
  await prisma.subjectsOnTeachers.deleteMany()
  await prisma.session.deleteMany()
  await prisma.group.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.user.deleteMany()
  await prisma.address.deleteMany()

  // Create Addresses
  const addresses = await Promise.all(
    Array.from({ length: 50 }).map(() => 
      prisma.address.create({
        data: {
          street: faker.location.streetAddress(),
          house: faker.location.buildingNumber(),
          city: faker.location.city(),
          zip: faker.location.zipCode(),
          country: faker.location.country()
        }
      })
    )
  )

  // Create hardcoded student user
  const studentUser = await prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@example.com',
      login: 'student',
      password: await bcrypt.hash("student", 10),
      isEmailConfirmed: true,
      phoneNumber: faker.phone.number(),
      birthDate: faker.date.past({ years: 20 }),
      role: 'STUDENT',
      addressId: addresses[0].id
    }
  })

  // Create hardcoded teacher user
  const teacherUser = await prisma.user.create({
    data: {
      firstName: 'Pro',
      lastName: 'Professor',
      email: 'teacher@example.com',
      login: 'teacher',
      password: await bcrypt.hash("teacher", 10),
      isEmailConfirmed: true,
      phoneNumber: faker.phone.number(),
      birthDate: faker.date.past({ years: 40 }),
      role: 'TEACHER',
      addressId: addresses[1].id
    }
  })

  // Create Users
  const users = await Promise.all(
    Array.from({ length: 100 }).map(async (_, index) => {
      const firstName = faker.person.firstName()
      const lastName = faker.person.lastName()
      const role = roles[index < 10 ? 0 : index < 30 ? 1 : 2]

      return prisma.user.create({
        data: {
          firstName,
          lastName,
          email: faker.internet.email({ firstName, lastName }),
          login: faker.internet.username({ firstName, lastName }),
          password: await bcrypt.hash("123", 10),
          isEmailConfirmed: faker.datatype.boolean(),
          phoneNumber: faker.phone.number(),
          birthDate: faker.date.past({ years: 47 }), // Changed to years
          role: role,
          addressId: addresses[faker.number.int({ min: 0, max: addresses.length - 1 })].id
        }
      })
    })
  )

  const allUsers = [studentUser, teacherUser, ...users];

  // Create Subjects
  const subjects = await Promise.all(
    [
      'Mathematics', 'Physics', 'Chemistry', 'Biology', 
      'Computer Science', 'History', 'Literature', 
      'Foreign Languages', 'Art', 'Music'
    ].map(name => 
      prisma.subject.create({ data: { name } })
    )
  )

  // Create Groups
  const groups = await Promise.all(
    Array.from({ length: 10 }).map((_, index) => 
      prisma.group.create({
        data: { 
          name: `Group ${faker.vehicle.manufacturer().slice(0, 3)}-${index + 1}` 
        }
      })
    )
  )

  // Assign Students to Groups
  const studentsOnGroups = await Promise.all([
    // Ensure hardcoded student is in Group 1
    prisma.studentsOnGroups.create({
      data: {
        groupId: groups[0].id,
        studentId: studentUser.id
      }
    }),
    ...groups.flatMap(group => 
      allUsers
        .filter(user => user.role === 'STUDENT' && user.id !== studentUser.id)
        .slice(0, faker.number.int({ min: 10, max: 20 }))
        .map(student => 
          prisma.studentsOnGroups.create({
            data: {
              groupId: group.id,
              studentId: student.id
            }
          })
        )
    )
  ])

  // Create Subjects on Teachers
  const subjectsOnTeachers = await Promise.all([
    // Ensure hardcoded teacher has subjects
    ...subjects.slice(0, 3).map(subject => 
      prisma.subjectsOnTeachers.create({
        data: {
          subjectId: subject.id,
          teacherId: teacherUser.id
        }
      })
    ),
    ...allUsers
      .filter(user => user.role === 'TEACHER' && user.id !== teacherUser.id)
      .flatMap(teacher => 
        subjects
          .slice(0, faker.number.int({ min: 1, max: 3 }))
          .map(subject => 
            prisma.subjectsOnTeachers.create({
              data: {
                subjectId: subject.id,
                teacherId: teacher.id
              }
            })
          )
      )
  ])

  // Link Groups to Subjects on Teachers
  const groupsOnSubjectsOnTeachers = await Promise.all(
    subjectsOnTeachers.flatMap(subjectOnTeacher => 
      groups
        .slice(0, faker.number.int({ min: 1, max: 3 }))
        .map(group => 
          prisma.groupsOnSubjectsOnTeachers.create({
            data: {
              groupId: group.id,
              subjectOnTeacherId: subjectOnTeacher.id
            }
          })
        )
    )
  )

  // Create Timetable with structured weekly schedule
  // Helper function to get dates for a week range
  function getWeekDates(weeksOffset: number): Date[] {
    const today = new Date()
    const dates: Date[] = []
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weeksOffset * 7)) // Monday
    
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Create a weekly schedule template (same for all weeks)
  const weeklySchedule: Array<{ groupId: number, subjectOnTeacherId: number, day: number, lessonNumber: number }> = []
  
  // Ensure student and teacher are connected
  const studentGroup = groups[0] // Use first group for student
  await prisma.studentsOnGroups.upsert({
    where: {
      groupId_studentId: {
        groupId: studentGroup.id,
        studentId: studentUser.id
      }
    },
    update: {},
    create: {
      studentId: studentUser.id,
      groupId: studentGroup.id
    }
  })

  // Track used slots to avoid overlaps: key is "teacherId-date-lessonNumber" or "groupId-date-lessonNumber"
  const usedSlots = new Set<string>()

  // Generate base weekly schedule for each group
  for (const group of groups) {
    const groupSubjects = groupsOnSubjectsOnTeachers.filter(gst => gst.groupId === group.id)
    if (groupSubjects.length === 0) continue

    // Assign 3-4 lessons per day for each group
    for (let day = 0; day < 5; day++) { // Monday to Friday
      const lessonsPerDay = faker.number.int({ min: 3, max: 5 })
      for (let lessonNum = 1; lessonNum <= lessonsPerDay; lessonNum++) {
        const randomSubject = faker.helpers.arrayElement(groupSubjects)
        const subjectOnTeacher = subjectsOnTeachers.find(st => st.id === randomSubject.subjectOnTeacherId)
        if (!subjectOnTeacher) continue

        weeklySchedule.push({
          groupId: group.id,
          subjectOnTeacherId: subjectOnTeacher.id,
          day,
          lessonNumber: lessonNum
        })
      }
    }
  }

  // Generate timetables for past week and future 2 weeks
  const timetable = []
  for (let weekOffset = -1; weekOffset <= 2; weekOffset++) {
    const weekDates = getWeekDates(weekOffset)
    
    for (const scheduleItem of weeklySchedule) {
      const lessonDate = new Date(weekDates[scheduleItem.day])
      lessonDate.setHours(8 + scheduleItem.lessonNumber, 0, 0, 0)
      
      const subjectOnTeacher = subjectsOnTeachers.find(st => st.id === scheduleItem.subjectOnTeacherId)
      if (!subjectOnTeacher) continue

      // Check for conflicts
      const teacherSlotKey = `${subjectOnTeacher.teacherId}-${lessonDate.toISOString()}-${scheduleItem.lessonNumber}`
      const groupSlotKey = `${scheduleItem.groupId}-${lessonDate.toISOString()}-${scheduleItem.lessonNumber}`
      
      if (usedSlots.has(teacherSlotKey) || usedSlots.has(groupSlotKey)) {
        continue // Skip if there's a conflict
      }

      usedSlots.add(teacherSlotKey)
      usedSlots.add(groupSlotKey)

      const entry = await prisma.timetable.create({
        data: {
          date: lessonDate,
          lessonNumber: scheduleItem.lessonNumber,
          subjectOnTeacherId: scheduleItem.subjectOnTeacherId,
          groupId: scheduleItem.groupId,
          isCanceled: weekOffset >= 0 ? faker.datatype.boolean(0.03) : false // Rarely cancel future lessons
        }
      })
      timetable.push(entry)
    }
  }

  // Create Grades
  const grades = await Promise.all(
    allUsers
      .filter(user => user.role === 'STUDENT')
      .flatMap(student => 
         subjectsOnTeachers
            .slice(0, faker.number.int({ min: 1, max: 3 }))
            .map(subjectOnTeacher => 
               prisma.grade.create({
                  data: {
                     value: faker.helpers.arrayElement([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6]),
                     description: faker.lorem.sentence(),
                     weight: faker.number.int({ min: 1, max: 6 }),
                     studentId: student.id,
                     subjectOnTeacherId: subjectOnTeacher.id
                  }
               })
            )
      )
  )

  // Create Announcements
  const announcements = await Promise.all(
    Array.from({ length: 20 }).map(() => {
      const teacher = allUsers.find(u => u.role === 'TEACHER')
      return prisma.announcement.create({
        data: {
          authorId: teacher!.id,
          title: faker.lorem.words(5),
          content: faker.lorem.paragraphs(2)
        }
      })
    })
  )

  // Create Messages
  const messages = await Promise.all(
    Array.from({ length: 60 }).map((_, index) => {
      // Ensure some messages are for/from our test users
      const isForTestStudent = index < 10;
      const isForTestTeacher = index >= 10 && index < 20;

      let author: any;
      let receivers: any[];

      if (isForTestStudent) {
        author = teacherUser;
        receivers = [studentUser];
      } else if (isForTestTeacher) {
        author = studentUser;
        receivers = [teacherUser];
      } else {
        author = allUsers[faker.number.int({ min: 0, max: allUsers.length - 1 })];
        receivers = allUsers
          .filter(u => u.id !== author.id)
          .slice(0, faker.number.int({ min: 1, max: 3 }));
      }

      const message = prisma.message.create({
        data: {
          authorId: author.id,
          title: faker.lorem.words(5),
          content: faker.lorem.paragraphs(2),
          receivers: {
            create: receivers.map(receiver => ({
              userId: receiver.id,
              isRead: faker.datatype.boolean()
            }))
          }
        }
      })

      return message
    })
  )

  // Create Attendance
  // For each record in the timetable that is in the past, create attendance for students in that group
  const pastLessons = timetable.filter(item => new Date(item.date) < new Date());
  
  await Promise.all(
    pastLessons.flatMap(async (lesson) => {
      // Find students in this group
      const studentsInGroup = await prisma.studentsOnGroups.findMany({
        where: { groupId: lesson.groupId },
        select: { studentId: true }
      });

      return Promise.all(
        studentsInGroup.map((sig: { studentId: number }) => {
          const status = faker.helpers.arrayElement(['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED']);
          return prisma.attendance.create({
            data: {
              status: status as any,
              timetableId: lesson.id,
              studentId: sig.studentId,
              justification: status === 'ABSENT' ? faker.helpers.arrayElement([faker.lorem.sentence(), null]) : null
            }
          });
        })
      );
    })
  );

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })