require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const User = require("../models/User");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const Consultation = require("../models/Consultation");

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || "Password@123";
const TODAY = new Date().toISOString().slice(0, 10);

const run = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Patient.deleteMany({}),
    Appointment.deleteMany({}),
    Consultation.deleteMany({}),
  ]);

  console.log("Creating users...");
  // Passwords are hashed automatically by the User model's pre-save hook.
  const admin = await User.create({
    name: "System Admin",
    email: "admin@clinic.com",
    password: DEFAULT_PASSWORD,
    role: "ADMIN",
    phone: "9000000001",
  });

  const [reception1, reception2] = await User.create([
    { name: "Kavya Menon", email: "receptionist1@clinic.com", password: DEFAULT_PASSWORD, role: "RECEPTIONIST", phone: "9000000002" },
    { name: "Suresh Nair", email: "receptionist2@clinic.com", password: DEFAULT_PASSWORD, role: "RECEPTIONIST", phone: "9000000003" },
  ]);

  const [drRavi, drPriya, drKumar] = await User.create([
    { name: "Dr. Ravi Shankar", email: "doctor1@clinic.com", password: DEFAULT_PASSWORD, role: "DOCTOR", phone: "9000000004", specialization: "General Medicine" },
    { name: "Dr. Priya Raman", email: "doctor2@clinic.com", password: DEFAULT_PASSWORD, role: "DOCTOR", phone: "9000000005", specialization: "Pediatrics" },
    { name: "Dr. Anand Kumar", email: "doctor3@clinic.com", password: DEFAULT_PASSWORD, role: "DOCTOR", phone: "9000000006", specialization: "Orthopedics" },
  ]);

  console.log("Creating patients...");
  const patientData = [
    { name: "Arun Kumar", age: 34, gender: "MALE", phone: "9111111111", email: "arun@example.com", address: "Coimbatore" },
    { name: "Meena Iyer", age: 28, gender: "FEMALE", phone: "9111111112", email: "meena@example.com", address: "Chennai" },
    { name: "Vijay Anand", age: 45, gender: "MALE", phone: "9111111113", address: "Madurai" },
    { name: "Divya Sharma", age: 31, gender: "FEMALE", phone: "9111111114", address: "Coimbatore" },
    { name: "Rahul Verma", age: 52, gender: "MALE", phone: "9111111115", address: "Salem" },
    { name: "Lakshmi Priya", age: 40, gender: "FEMALE", phone: "9111111116", address: "Erode" },
    { name: "Kiran Rao", age: 22, gender: "MALE", phone: "9111111117", address: "Coimbatore" },
    { name: "Anjali Das", age: 36, gender: "FEMALE", phone: "9111111118", address: "Trichy" },
  ];
  const patients = [];
  for (const p of patientData) {
    patients.push(await Patient.create(p)); // created one-by-one so patientId auto-increment stays sequential
  }
  const [arun, meena, vijay, divya, rahul, lakshmi, kiran, anjali] = patients;

  console.log("Creating appointments + consultations...");

  // Helper to create an appointment + matching consultation, and mark it completed
  let tokenCounters = {}; // per-doctor token counter for today
  const nextToken = (doctorId) => {
    const key = String(doctorId);
    tokenCounters[key] = (tokenCounters[key] || 0) + 1;
    return tokenCounters[key];
  };

  const addCompletedVisit = async (patient, doctor, time, visit) => {
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      createdBy: reception1._id,
      appointmentDate: TODAY,
      appointmentTime: time,
      tokenNumber: nextToken(doctor._id),
      status: "COMPLETED",
      reason: visit.reason || "Consultation",
    });
    await Consultation.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentId: appointment._id,
      symptoms: visit.symptoms,
      diagnosis: visit.diagnosis,
      prescription: visit.prescription,
      notes: visit.notes,
    });
    return appointment;
  };

  // --- THE key demo scenario: Arun Kumar seen by THREE different doctors ---
  await addCompletedVisit(arun, drRavi, "09:00 AM", {
    reason: "Fever",
    symptoms: "Fever and body ache for 2 days",
    diagnosis: "Viral fever",
    prescription: "Paracetamol 500mg twice daily for 3 days, plenty of fluids",
    notes: "Advised rest. Follow up if fever persists beyond 3 days.",
  });
  await addCompletedVisit(arun, drPriya, "11:30 AM", {
    reason: "Persistent headache",
    symptoms: "Headache, mild nausea",
    diagnosis: "Tension headache, possibly linked to recent viral fever",
    prescription: "Ibuprofen 400mg as needed, hydration",
    notes: "No red-flag symptoms observed. Reviewed Dr. Ravi's prior fever diagnosis.",
  });
  await addCompletedVisit(arun, drRavi, "10:00 AM", {
    reason: "Follow-up",
    symptoms: "Follow-up visit, fever resolved",
    diagnosis: "Recovered from viral fever",
    prescription: "None — course completed",
    notes: "Full recovery confirmed. No further action needed.",
  });

  // --- A few more completed visits for other patients ---
  await addCompletedVisit(meena, drKumar, "09:30 AM", {
    reason: "Knee pain",
    symptoms: "Pain in right knee after a fall",
    diagnosis: "Mild ligament sprain",
    prescription: "Ice application, Diclofenac gel, rest for 5 days",
    notes: "X-ray showed no fracture.",
  });
  await addCompletedVisit(vijay, drRavi, "12:00 PM", {
    reason: "Routine checkup",
    symptoms: "General weakness",
    diagnosis: "Mild anemia",
    prescription: "Iron supplements, dietary advice",
    notes: "Repeat blood test after 4 weeks.",
  });
  await addCompletedVisit(divya, drPriya, "02:00 PM", {
    reason: "Child fever (accompanying)",
    symptoms: "Cold and cough",
    diagnosis: "Common cold",
    prescription: "Antihistamine syrup, rest",
    notes: "Symptomatic treatment advised.",
  });

  // --- WAITING / IN_CONSULTATION appointments so the queue has live demo data ---
  await Appointment.create({
    patientId: rahul._id,
    doctorId: drKumar._id,
    createdBy: reception2._id,
    appointmentDate: TODAY,
    appointmentTime: "03:00 PM",
    tokenNumber: nextToken(drKumar._id),
    status: "WAITING",
    reason: "Back pain",
  });
  await Appointment.create({
    patientId: lakshmi._id,
    doctorId: drRavi._id,
    createdBy: reception1._id,
    appointmentDate: TODAY,
    appointmentTime: "03:15 PM",
    tokenNumber: nextToken(drRavi._id),
    status: "WAITING",
    reason: "Cough and cold",
  });
  await Appointment.create({
    patientId: kiran._id,
    doctorId: drPriya._id,
    createdBy: reception2._id,
    appointmentDate: TODAY,
    appointmentTime: "03:30 PM",
    tokenNumber: nextToken(drPriya._id),
    status: "IN_CONSULTATION",
    reason: "Skin rash",
  });
  await Appointment.create({
    patientId: anjali._id,
    doctorId: drKumar._id,
    createdBy: reception1._id,
    appointmentDate: TODAY,
    appointmentTime: "03:45 PM",
    tokenNumber: nextToken(drKumar._id),
    status: "CANCELLED",
    reason: "Shoulder pain",
  });

  console.log("\nSeed data created successfully!\n");
  console.log("========== DEMO LOGIN CREDENTIALS ==========");
  console.log(`Admin:         admin@clinic.com          / ${DEFAULT_PASSWORD}`);
  console.log(`Receptionist:  receptionist1@clinic.com  / ${DEFAULT_PASSWORD}`);
  console.log(`Receptionist:  receptionist2@clinic.com  / ${DEFAULT_PASSWORD}`);
  console.log(`Doctor:        doctor1@clinic.com (Dr. Ravi Shankar)  / ${DEFAULT_PASSWORD}`);
  console.log(`Doctor:        doctor2@clinic.com (Dr. Priya Raman)   / ${DEFAULT_PASSWORD}`);
  console.log(`Doctor:        doctor3@clinic.com (Dr. Anand Kumar)   / ${DEFAULT_PASSWORD}`);
  console.log("=============================================");
  console.log(`\nDemo scenario: open patient "${arun.name}" (${arun.patientId}) to see`);
  console.log("consultations from Dr. Ravi Shankar AND Dr. Priya Raman under one history.\n");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
