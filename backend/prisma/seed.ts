import { PrismaClient, UserRole, SessionStatus, ResourceType, GoalStatus, Priority } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Create admin user
  const adminPassword = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fides.com' },
    update: {},
    create: {
      email: 'admin@fides.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'FIDES',
      role: UserRole.ADMIN,
      bio: 'Administrador del sistema FIDES',
      expertise: 'Gestión de plataforma',
      profilePicture: 'https://ui-avatars.com/api/?name=Admin+FIDES&background=0D8ABC&color=fff',
    },
  });

  // Create mentor users
  const mentorPassword = await bcrypt.hash('password123', 10);
  const mentor1 = await prisma.user.upsert({
    where: { email: 'maria.garcia@fides.com' },
    update: {},
    create: {
      email: 'maria.garcia@fides.com',
      password: mentorPassword,
      firstName: 'María',
      lastName: 'García',
      role: UserRole.MENTOR,
      bio: 'Experta en desarrollo web con más de 10 años de experiencia. Especializada en React, Node.js y arquitectura de aplicaciones.',
      expertise: 'Desarrollo Web, React, Node.js, JavaScript',
      linkedinUrl: 'https://linkedin.com/in/mariagarcia',
      profilePicture: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=5E72E4&color=fff',
    },
  });

  const mentor2 = await prisma.user.upsert({
    where: { email: 'carlos.lopez@fides.com' },
    update: {},
    create: {
      email: 'carlos.lopez@fides.com',
      password: mentorPassword,
      firstName: 'Carlos',
      lastName: 'López',
      role: UserRole.MENTOR,
      bio: 'Consultor de marketing digital y estrategia de marca. Ayudo a empresas a crecer en el mundo digital.',
      expertise: 'Marketing Digital, SEO, SEM, Redes Sociales',
      linkedinUrl: 'https://linkedin.com/in/carloslopez',
      profilePicture: 'https://ui-avatars.com/api/?name=Carlos+Lopez&background=F5365C&color=fff',
    },
  });

  // Create mentee users
  const menteePassword = await bcrypt.hash('password123', 10);
  const mentee1 = await prisma.user.upsert({
    where: { email: 'juan.perez@gmail.com' },
    update: {},
    create: {
      email: 'juan.perez@gmail.com',
      password: menteePassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      role: UserRole.MENTEE,
      bio: 'Desarrollador junior buscando mejorar mis habilidades en frontend',
      expertise: 'HTML, CSS, JavaScript básico',
      profilePicture: 'https://ui-avatars.com/api/?name=Juan+Perez&background=8B5CF6&color=fff',
    },
  });

  const mentee2 = await prisma.user.upsert({
    where: { email: 'sofia.gonzalez@gmail.com' },
    update: {},
    create: {
      email: 'sofia.gonzalez@gmail.com',
      password: menteePassword,
      firstName: 'Sofía',
      lastName: 'González',
      role: UserRole.MENTEE,
      bio: 'Estudiante de marketing interesada en especializarme en marketing digital',
      expertise: 'Marketing tradicional, Redes sociales',
      profilePicture: 'https://ui-avatars.com/api/?name=Sofia+Gonzalez&background=EC4899&color=fff',
    },
  });

  // Create availability for mentors
  const availabilities = [
    // John's availability (Monday, Wednesday, Friday)
    {
      userId: mentor1.id,
      dayOfWeek: 1, // Monday
      startTime: '09:00',
      endTime: '12:00',
      isRecurring: true,
    },
    {
      userId: mentor1.id,
      dayOfWeek: 3, // Wednesday
      startTime: '14:00',
      endTime: '17:00',
      isRecurring: true,
    },
    {
      userId: mentor1.id,
      dayOfWeek: 5, // Friday
      startTime: '10:00',
      endTime: '13:00',
      isRecurring: true,
    },
    // Sarah's availability (Tuesday, Thursday)
    {
      userId: mentor2.id,
      dayOfWeek: 2, // Tuesday
      startTime: '10:00',
      endTime: '15:00',
      isRecurring: true,
    },
    {
      userId: mentor2.id,
      dayOfWeek: 4, // Thursday
      startTime: '13:00',
      endTime: '18:00',
      isRecurring: true,
    },
  ];

  for (const availability of availabilities) {
    await prisma.availability.create({
      data: availability,
    });
  }

  console.log('✅ Seed completado exitosamente');
  console.log('📧 Credenciales de acceso:');
  console.log('   Admin: admin@fides.com / password123');
  console.log('   Mentor: maria.garcia@fides.com / password123');
  console.log('   Mentee: juan.perez@gmail.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });