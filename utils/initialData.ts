import { Employee } from '../types';

// Helper to parse date from M/D/YYYY to YYYY-MM-DD (if needed) or pass ISO string
// The new dataset uses ISO YYYY-MM-DD so this helper is less critical but good to keep if needed
// However, the provided data is YYYY-MM-DD, so we can pass it directly.
// The user prompt said: "dateOfBirth: string | null // ISO YYYY-MM-DD"
// But the JSON example has: "dateOfBirth":"2002-06-20"
// So we can use it directly.

const rawData = [
  {"fullName":"Alina Miller","dateOfBirth":"2002-06-20","age":23,"startDate":"2025-05-09","totalDaysWorked":222,"priorExperienceMonths":0,"currentMonthsWorked":7.4,"totalMonthsExperience":7.4,"vrStatus":"VR1","monthsUntilNextRate":4.6},
  {"fullName":"Anna Kvitová","dateOfBirth":"1995-08-09","age":30,"startDate":"2024-06-01","totalDaysWorked":564,"priorExperienceMonths":0,"currentMonthsWorked":18.8,"totalMonthsExperience":18.8,"vrStatus":"VR2","monthsUntilNextRate":17.2},
  {"fullName":"Anthony Allen","dateOfBirth":"1990-01-16","age":35,"startDate":"2024-05-27","totalDaysWorked":569,"priorExperienceMonths":0,"currentMonthsWorked":19,"totalMonthsExperience":19,"vrStatus":"VR2","monthsUntilNextRate":17},
  {"fullName":"Ari Karl","dateOfBirth":"2005-04-14","age":20,"startDate":"2025-04-30","totalDaysWorked":231,"priorExperienceMonths":0,"currentMonthsWorked":7.7,"totalMonthsExperience":7.7,"vrStatus":"VR1","monthsUntilNextRate":4.3},
  {"fullName":"Ben Massey","dateOfBirth":"1999-04-09","age":26,"startDate":"2024-10-29","totalDaysWorked":414,"priorExperienceMonths":0,"currentMonthsWorked":13.8,"totalMonthsExperience":13.8,"vrStatus":"VR2","monthsUntilNextRate":22.2},
  {"fullName":"Bríet Valdís Reeve","dateOfBirth":"2008-07-23","age":17,"startDate":"2024-12-27","totalDaysWorked":355,"priorExperienceMonths":0,"currentMonthsWorked":11.8,"totalMonthsExperience":11.8,"vrStatus":"VR1","monthsUntilNextRate":0.2},
  {"fullName":"Cale Galbraith","dateOfBirth":"2001-06-26","age":24,"startDate":"2023-09-18","totalDaysWorked":821,"priorExperienceMonths":0,"currentMonthsWorked":27.4,"totalMonthsExperience":27.4,"vrStatus":"VR2","monthsUntilNextRate":8.6},
  {"fullName":"Chantel Jones","dateOfBirth":"1996-07-13","age":29,"startDate":"2025-02-27","totalDaysWorked":293,"priorExperienceMonths":0,"currentMonthsWorked":9.8,"totalMonthsExperience":9.8,"vrStatus":"VR1","monthsUntilNextRate":2.2},
  {"fullName":"Elijah Owens","dateOfBirth":"1997-02-25","age":28,"startDate":"2023-07-25","totalDaysWorked":876,"priorExperienceMonths":0,"currentMonthsWorked":29.2,"totalMonthsExperience":29.2,"vrStatus":"VR2","monthsUntilNextRate":6.8},
  {"fullName":"Elisa Nina","dateOfBirth":"2002-12-25","age":22,"startDate":"2023-09-02","totalDaysWorked":837,"priorExperienceMonths":0,"currentMonthsWorked":27.9,"totalMonthsExperience":27.9,"vrStatus":"VR2","monthsUntilNextRate":8.1},
  {"fullName":"Elvar Gapunay","dateOfBirth":"2001-08-24","age":24,"startDate":"2024-10-01","totalDaysWorked":442,"priorExperienceMonths":0,"currentMonthsWorked":14.7,"totalMonthsExperience":14.7,"vrStatus":"VR2","monthsUntilNextRate":21.3},
  {"fullName":"Emil Baldursson","dateOfBirth":"1998-09-04","age":27,"startDate":"2025-05-20","totalDaysWorked":211,"priorExperienceMonths":0,"currentMonthsWorked":7,"totalMonthsExperience":7,"vrStatus":"VR1","monthsUntilNextRate":5},
  {"fullName":"Emilía Árora","dateOfBirth":"2007-06-04","age":18,"startDate":"2025-06-25","totalDaysWorked":175,"priorExperienceMonths":0,"currentMonthsWorked":5.8,"totalMonthsExperience":5.8,"vrStatus":"VR0","monthsUntilNextRate":0.2},
  {"fullName":"Enrique Morales","dateOfBirth":"1995-12-01","age":30,"startDate":"2024-01-07","totalDaysWorked":710,"priorExperienceMonths":0,"currentMonthsWorked":23.7,"totalMonthsExperience":23.7,"vrStatus":"VR2","monthsUntilNextRate":12.3},
  {"fullName":"Fabien Dambron","dateOfBirth":"1985-05-15","age":40,"startDate":"2024-06-07","totalDaysWorked":558,"priorExperienceMonths":0,"currentMonthsWorked":18.6,"totalMonthsExperience":18.6,"vrStatus":"VR2","monthsUntilNextRate":17.4},
  {"fullName":"Gareth Wild","dateOfBirth":"1986-05-08","age":39,"startDate":"2025-09-08","totalDaysWorked":100,"priorExperienceMonths":24,"currentMonthsWorked":3.3,"totalMonthsExperience":27.3,"vrStatus":"VR2","monthsUntilNextRate":8.7},
  {"fullName":"Gloriousgospel Henry","dateOfBirth":"2000-10-18","age":25,"startDate":"2025-04-29","totalDaysWorked":232,"priorExperienceMonths":0,"currentMonthsWorked":7.7,"totalMonthsExperience":7.7,"vrStatus":"VR1","monthsUntilNextRate":4.3},
  {"fullName":"Herdis Davidsdottir","dateOfBirth":"2008-04-04","age":17,"startDate":"2023-06-05","totalDaysWorked":926,"priorExperienceMonths":0,"currentMonthsWorked":30.9,"totalMonthsExperience":30.9,"vrStatus":"VR2","monthsUntilNextRate":5.1},
  {"fullName":"Iva Vladimirová","dateOfBirth":"1998-04-30","age":27,"startDate":"2024-01-25","totalDaysWorked":692,"priorExperienceMonths":0,"currentMonthsWorked":23.1,"totalMonthsExperience":23.1,"vrStatus":"VR2","monthsUntilNextRate":12.9},
  {"fullName":"Jack Bandak","dateOfBirth":"2002-11-24","age":23,"startDate":"2025-02-28","totalDaysWorked":292,"priorExperienceMonths":0,"currentMonthsWorked":9.7,"totalMonthsExperience":9.7,"vrStatus":"VR1","monthsUntilNextRate":2.3},
  {"fullName":"Jarred Stancil","dateOfBirth":"1994-06-13","age":31,"startDate":"2025-04-25","totalDaysWorked":236,"priorExperienceMonths":24,"currentMonthsWorked":7.9,"totalMonthsExperience":31.9,"vrStatus":"VR2","monthsUntilNextRate":4.1},
  {"fullName":"Jasmín Luana","dateOfBirth":"2002-09-07","age":23,"startDate":"2025-04-26","totalDaysWorked":235,"priorExperienceMonths":0,"currentMonthsWorked":7.8,"totalMonthsExperience":7.8,"vrStatus":"VR1","monthsUntilNextRate":4.2},
  {"fullName":"Laura Petrone","dateOfBirth":"1996-12-20","age":28,"startDate":"2024-12-16","totalDaysWorked":366,"priorExperienceMonths":0,"currentMonthsWorked":12.2,"totalMonthsExperience":12.2,"vrStatus":"VR1","monthsUntilNextRate":23.8},
  {"fullName":"Lucia Lara","dateOfBirth":"2000-06-05","age":25,"startDate":"2025-05-05","totalDaysWorked":226,"priorExperienceMonths":0,"currentMonthsWorked":7.5,"totalMonthsExperience":7.5,"vrStatus":"VR1","monthsUntilNextRate":4.5},
  {"fullName":"Marieta Zderic","dateOfBirth":"1999-09-04","age":26,"startDate":"2024-10-01","totalDaysWorked":442,"priorExperienceMonths":0,"currentMonthsWorked":14.7,"totalMonthsExperience":14.7,"vrStatus":"VR2","monthsUntilNextRate":21.3},
  {"fullName":"Michael Hansen","dateOfBirth":"1987-12-31","age":37,"startDate":"2024-10-01","totalDaysWorked":442,"priorExperienceMonths":0,"currentMonthsWorked":14.7,"totalMonthsExperience":14.7,"vrStatus":"VR2","monthsUntilNextRate":21.3},
  {"fullName":"Paola Tunarosa","dateOfBirth":"2003-03-27","age":22,"startDate":"2025-05-16","totalDaysWorked":215,"priorExperienceMonths":0,"currentMonthsWorked":7.2,"totalMonthsExperience":7.2,"vrStatus":"VR1","monthsUntilNextRate":4.8},
  {"fullName":"Rachel Ogimont","dateOfBirth":"2001-08-09","age":24,"startDate":"2025-06-28","totalDaysWorked":172,"priorExperienceMonths":0,"currentMonthsWorked":5.7,"totalMonthsExperience":5.7,"vrStatus":"VR1","monthsUntilNextRate":6.3},
  {"fullName":"Robin Schindfessel","dateOfBirth":"2001-03-10","age":24,"startDate":"2025-01-20","totalDaysWorked":331,"priorExperienceMonths":0,"currentMonthsWorked":11,"totalMonthsExperience":11,"vrStatus":"VR1","monthsUntilNextRate":1},
  {"fullName":"Roksana Owczarek","dateOfBirth":"2003-09-02","age":22,"startDate":"2023-06-20","totalDaysWorked":911,"priorExperienceMonths":0,"currentMonthsWorked":30.4,"totalMonthsExperience":30.4,"vrStatus":"VR2","monthsUntilNextRate":5.6},
  {"fullName":"Sophie Pietrzok","dateOfBirth":"2000-07-11","age":25,"startDate":"2023-06-12","totalDaysWorked":919,"priorExperienceMonths":0,"currentMonthsWorked":30.6,"totalMonthsExperience":30.6,"vrStatus":"VR2","monthsUntilNextRate":5.4},
  {"fullName":"Tiana Dusil","dateOfBirth":"1999-09-04","age":26,"startDate":"2025-09-04","totalDaysWorked":104,"priorExperienceMonths":0,"currentMonthsWorked":3.5,"totalMonthsExperience":3.5,"vrStatus":"VR1","monthsUntilNextRate":8.5},
  {"fullName":"Zachary Owens","dateOfBirth":"1996-06-03","age":29,"startDate":"2024-11-02","totalDaysWorked":410,"priorExperienceMonths":0,"currentMonthsWorked":13.7,"totalMonthsExperience":13.7,"vrStatus":"VR2","monthsUntilNextRate":22.3}
];

export const INITIAL_EMPLOYEES: Employee[] = rawData.map((data) => {
  const parts = data.fullName.split(' ');
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');

  // Mapping to Employee interface
  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    dateOfBirth: data.dateOfBirth || '',
    startDate: data.startDate || '',
    previousExperienceMonths: data.priorExperienceMonths || 0,
    statusVR: data.vrStatus || 'VR0',
    gender: 'Other', // Unknown from dataset
    country: 'Unknown', // Unknown from dataset
    role: 'Employee', // Default role
    languages: [], // Unknown from dataset
    sickDaysYTD: 0,
    performanceRating: 3, // Default average rating
    totalExperienceMonths: data.totalMonthsExperience || 0,
    monthsToNextRaise: data.monthsUntilNextRate,
    age: data.age || undefined,
    customFields: {
      totalDaysWorked: data.totalDaysWorked,
      currentMonthsWorked: data.currentMonthsWorked
    },
  };
});
