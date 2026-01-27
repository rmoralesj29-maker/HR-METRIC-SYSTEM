import { Employee } from '../types';

const rawData = [
  {"fullName":"Alina Miller","dateOfBirth":"2002-06-20","startDate":"2025-05-09","vrStatus":"VR1"},
  {"fullName":"Anna Kvitová","dateOfBirth":"1995-08-09","startDate":"2024-06-01","vrStatus":"VR2"},
  {"fullName":"Anthony Allen","dateOfBirth":"1990-01-16","startDate":"2024-05-27","vrStatus":"VR2"},
  {"fullName":"Ari Karl","dateOfBirth":"2005-04-14","startDate":"2025-04-30","vrStatus":"VR1"},
  {"fullName":"Ben Massey","dateOfBirth":"1999-04-09","startDate":"2024-10-29","vrStatus":"VR2"},
  {"fullName":"Bríet Valdís Reeve","dateOfBirth":"2008-07-23","startDate":"2024-12-27","vrStatus":"VR1"},
  {"fullName":"Cale Galbraith","dateOfBirth":"2001-06-26","startDate":"2023-09-18","vrStatus":"VR2"},
  {"fullName":"Chantel Jones","dateOfBirth":"1996-07-13","startDate":"2025-02-27","vrStatus":"VR1"},
  {"fullName":"Elijah Owens","dateOfBirth":"1997-02-25","startDate":"2023-07-25","vrStatus":"VR2"},
  {"fullName":"Elisa Nina","dateOfBirth":"2002-12-25","startDate":"2023-09-02","vrStatus":"VR2"},
  {"fullName":"Elvar Gapunay","dateOfBirth":"2001-08-24","startDate":"2024-10-01","vrStatus":"VR2"},
  {"fullName":"Emil Baldursson","dateOfBirth":"1998-09-04","startDate":"2025-05-20","vrStatus":"VR1"},
  {"fullName":"Emilía Árora","dateOfBirth":"2007-06-04","startDate":"2025-06-25","vrStatus":"VR0"},
  {"fullName":"Enrique Morales","dateOfBirth":"1995-12-01","startDate":"2024-01-07","vrStatus":"VR2"},
  {"fullName":"Fabien Dambron","dateOfBirth":"1985-05-15","startDate":"2024-06-07","vrStatus":"VR2"},
  {"fullName":"Gareth Wild","dateOfBirth":"1986-05-08","startDate":"2025-09-08","vrStatus":"VR2"},
  {"fullName":"Gloriousgospel Henry","dateOfBirth":"2000-10-18","startDate":"2025-04-29","vrStatus":"VR1"},
  {"fullName":"Herdis Davidsdottir","dateOfBirth":"2008-04-04","startDate":"2023-06-05","vrStatus":"VR2"},
  {"fullName":"Iva Vladimirová","dateOfBirth":"1998-04-30","startDate":"2024-01-25","vrStatus":"VR2"},
  {"fullName":"Jack Bandak","dateOfBirth":"2002-11-24","startDate":"2025-02-28","vrStatus":"VR1"},
  {"fullName":"Jarred Stancil","dateOfBirth":"1994-06-13","startDate":"2025-04-25","vrStatus":"VR2"},
  {"fullName":"Jasmín Luana","dateOfBirth":"2002-09-07","startDate":"2025-04-26","vrStatus":"VR1"},
  {"fullName":"Laura Petrone","dateOfBirth":"1996-12-20","startDate":"2024-12-16","vrStatus":"VR1"},
  {"fullName":"Lucia Lara","dateOfBirth":"2000-06-05","startDate":"2025-05-05","vrStatus":"VR1"},
  {"fullName":"Marieta Zderic","dateOfBirth":"1999-09-04","startDate":"2024-10-01","vrStatus":"VR2"},
  {"fullName":"Michael Hansen","dateOfBirth":"1987-12-31","startDate":"2024-10-01","vrStatus":"VR2"},
  {"fullName":"Paola Tunarosa","dateOfBirth":"2003-03-27","startDate":"2025-05-16","vrStatus":"VR1"},
  {"fullName":"Rachel Ogimont","dateOfBirth":"2001-08-09","startDate":"2025-06-28","vrStatus":"VR1"},
  {"fullName":"Robin Schindfessel","dateOfBirth":"2001-03-10","startDate":"2025-01-20","vrStatus":"VR1"},
  {"fullName":"Roksana Owczarek","dateOfBirth":"2003-09-02","startDate":"2023-06-20","vrStatus":"VR2"},
  {"fullName":"Sophie Pietrzok","dateOfBirth":"2000-07-11","startDate":"2023-06-12","vrStatus":"VR2"},
  {"fullName":"Tiana Dusil","dateOfBirth":"1999-09-04","startDate":"2025-09-04","vrStatus":"VR1"},
  {"fullName":"Zachary Owens","dateOfBirth":"1996-06-03","startDate":"2024-11-02","vrStatus":"VR2"}
];

export const INITIAL_EMPLOYEES: Employee[] = rawData.map((data) => {
  const parts = data.fullName.split(' ');
  const lastName = parts.pop() || '';
  const firstName = parts.join(' ');

  return {
    id: crypto.randomUUID(),
    firstName,
    lastName,
    dateOfBirth: data.dateOfBirth,
    startDate: data.startDate,
    statusVR: data.vrStatus || 'VR0',
    gender: 'Other',
    country: 'Unknown',
    role: 'Employee',
    languages: [],
    performanceRating: 3,
    customFields: {},
    totalExperienceMonths: 0, // Will be calculated dynamically
  };
});
