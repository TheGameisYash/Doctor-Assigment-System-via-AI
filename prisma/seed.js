const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Reset database (optional but helpful for development seed)
  await prisma.doctorAssignment.deleteMany();
  await prisma.aIAnalysisLog.deleteMany();
  await prisma.patientReport.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.user.deleteMany();

  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('admin123', saltRounds);
  const patientPassword = await bcrypt.hash('patient123', saltRounds);
  const doctorPassword = await bcrypt.hash('doctor123', saltRounds);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@healthcare.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Created Admin user: ${admin.email}`);

  // 2. Create Patient
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@healthcare.com',
      password: patientPassword,
      role: 'PATIENT',
      patientProfile: {
        create: {
          name: 'John Doe',
          age: 34,
          gender: 'Male',
          phone: '123-456-7890',
        },
      },
    },
  });
  console.log(`Created Patient user: ${patientUser.email}`);

  // 3. Create Doctors
  const doctorsData = [
    {
      email: 'jenkins@healthcare.com',
      name: 'Dr. Sarah Jenkins',
      category: 'General Physician',
      specialization: 'Family Medicine',
      experience: 8,
    },
    {
      email: 'chen@healthcare.com',
      name: 'Dr. Robert Chen',
      category: 'Cardiologist',
      specialization: 'Cardiovascular Diseases',
      experience: 15,
    },
    {
      email: 'rostova@healthcare.com',
      name: 'Dr. Elena Rostova',
      category: 'Dermatologist',
      specialization: 'Clinical Dermatology',
      experience: 6,
    },
    {
      email: 'vance@healthcare.com',
      name: 'Dr. Marcus Vance',
      category: 'Orthopedic',
      specialization: 'Orthopedic Surgery',
      experience: 12,
    },
    {
      email: 'sterling@healthcare.com',
      name: 'Dr. Alice Sterling',
      category: 'Neurologist',
      specialization: 'Clinical Neurology',
      experience: 10,
    },
  ];

  for (const doc of doctorsData) {
    const docUser = await prisma.user.create({
      data: {
        email: doc.email,
        password: doctorPassword,
        role: 'DOCTOR',
        doctorProfile: {
          create: {
            name: doc.name,
            category: doc.category,
            specialization: doc.specialization,
            experience: doc.experience,
            available: true,
            status: 'ACTIVE',
          },
        },
      },
    });
    console.log(`Created Doctor user: ${docUser.email} (${doc.category})`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
