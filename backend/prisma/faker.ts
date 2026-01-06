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

  const allUsers = [studentUser, ...users];

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
  const subjectsOnTeachers = await Promise.all(
    allUsers
      .filter(user => user.role === 'TEACHER')
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
  )

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

  // Create Timetable
  const timetable = await Promise.all(
    Array.from({ length: 150 }).map(() => {
      const subjectOnTeacher = subjectsOnTeachers[faker.number.int({ min: 0, max: subjectsOnTeachers.length - 1 })]
      const group = groups[faker.number.int({ min: 0, max: groups.length - 1 })]
      const substitutionTeacher = faker.datatype.boolean(0.05) 
        ? allUsers.find(u => u.role === 'TEACHER') 
        : null

      // Generate a random date around the current week
      const today = new Date()
      // From 7 days ago to 14 days in the future
      const start = new Date()
      start.setDate(today.getDate() - 7)
      const end = new Date()
      end.setDate(today.getDate() + 14)
      
      let randomDate: Date;
      do {
        randomDate = faker.date.between({ from: start, to: end });
      } while (randomDate.getDay() === 0 || randomDate.getDay() === 6);

      return prisma.timetable.create({
        data: {
          date: randomDate,
          lessonNumber: faker.number.int({ min: 1, max: 6 }),
          subjectOnTeacherId: subjectOnTeacher.id,
          groupId: group.id,
          substitutionTeacherId: substitutionTeacher?.id,
          isCanceled: faker.datatype.boolean(0.05)
        }
      })
    })
  )

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
    Array.from({ length: 50 }).map((_, index) => {
      // Ensure first 10 messages are for our test student
      const isForTestStudent = index < 10;
      const author = isForTestStudent 
        ? allUsers.find(u => u.role === 'TEACHER')! 
        : allUsers[faker.number.int({ min: 0, max: allUsers.length - 1 })]
      
      const receivers = isForTestStudent 
        ? [studentUser]
        : allUsers
            .filter(u => u.id !== author.id)
            .slice(0, faker.number.int({ min: 1, max: 3 }))

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