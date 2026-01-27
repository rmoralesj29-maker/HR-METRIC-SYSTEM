import { Employee, VRRate, Gender } from '../types';

/**
 * Seed data for initial employees
 * VR Rate is stored explicitly
 * Tenure is calculated from startDate at runtime
 */
const rawData = [
  { fullName: 'Alina Miller', dateOfBirth: '2002-06-20', startDate: '2025-05-09', vrRate: 'VR1', gender: 'Female', country: 'USA', languages: ['English'] },
  { fullName: 'Anna Kvitová', dateOfBirth: '1995-08-09', startDate: '2024-06-01', vrRate: 'VR2', gender: 'Female', country: 'Czech Republic', languages: ['Czech', 'English'] },
  { fullName: 'Anthony Allen', dateOfBirth: '1990-01-16', startDate: '2024-05-27', vrRate: 'VR2', gender: 'Male', country: 'USA', languages: ['English'] },
  { fullName: 'Ari Karl', dateOfBirth: '2005-04-14', startDate: '2025-04-30', vrRate: 'VR1', gender: 'Male', country: 'Iceland', languages: ['Icelandic', 'English'] },
  { fullName: 'Ben Massey', dateOfBirth: '1999-04-09', startDate: '2024-10-29', vrRate: 'VR2', gender: 'Male', country: 'UK', languages: ['English'] },
  { fullName: 'Bríet Valdís Reeve', dateOfBirth: '2008-07-23', startDate: '2024-12-27', vrRate: 'VR1', gender: 'Female', country: 'Iceland', languages: ['Icelandic', 'English'] },
  { fullName: 'Cale Galbraith', dateOfBirth: '2001-06-26', startDate: '2023-09-18', vrRate: 'VR2', gender: 'Male', country: 'Canada', languages: ['English', 'French'] },
  { fullName: 'Chantel Jones', dateOfBirth: '1996-07-13', startDate: '2025-02-27', vrRate: 'VR1', gender: 'Female', country: 'USA', languages: ['English', 'Spanish'] },
  { fullName: 'Elijah Owens', dateOfBirth: '1997-02-25', startDate: '2023-07-25', vrRate: 'VR2', gender: 'Male', country: 'USA', languages: ['English'] },
  { fullName: 'Elisa Nina', dateOfBirth: '2002-12-25', startDate: '2023-09-02', vrRate: 'VR2', gender: 'Female', country: 'Italy', languages: ['Italian', 'English'] },
  { fullName: 'Elvar Gapunay', dateOfBirth: '2001-08-24', startDate: '2024-10-01', vrRate: 'VR2', gender: 'Male', country: 'Philippines', languages: ['Filipino', 'English'] },
  { fullName: 'Emil Baldursson', dateOfBirth: '1998-09-04', startDate: '2025-05-20', vrRate: 'VR1', gender: 'Male', country: 'Iceland', languages: ['Icelandic', 'English', 'Danish'] },
  { fullName: 'Emilía Árora', dateOfBirth: '2007-06-04', startDate: '2025-06-25', vrRate: 'VR0', gender: 'Female', country: 'Iceland', languages: ['Icelandic', 'English'] },
  { fullName: 'Enrique Morales', dateOfBirth: '1995-12-01', startDate: '2024-01-07', vrRate: 'VR2', gender: 'Male', country: 'Spain', languages: ['Spanish', 'English'] },
  { fullName: 'Fabien Dambron', dateOfBirth: '1985-05-15', startDate: '2024-06-07', vrRate: 'VR2', gender: 'Male', country: 'France', languages: ['French', 'English'] },
  { fullName: 'Gareth Wild', dateOfBirth: '1986-05-08', startDate: '2025-09-08', vrRate: 'VR2', gender: 'Male', country: 'UK', languages: ['English', 'Welsh'] },
  { fullName: 'Gloriousgospel Henry', dateOfBirth: '2000-10-18', startDate: '2025-04-29', vrRate: 'VR1', gender: 'Male', country: 'Nigeria', languages: ['English', 'Yoruba'] },
  { fullName: 'Herdis Davidsdottir', dateOfBirth: '2008-04-04', startDate: '2023-06-05', vrRate: 'VR2', gender: 'Female', country: 'Iceland', languages: ['Icelandic', 'English'] },
  { fullName: 'Iva Vladimirová', dateOfBirth: '1998-04-30', startDate: '2024-01-25', vrRate: 'VR2', gender: 'Female', country: 'Bulgaria', languages: ['Bulgarian', 'English'] },
  { fullName: 'Jack Bandak', dateOfBirth: '2002-11-24', startDate: '2025-02-28', vrRate: 'VR1', gender: 'Male', country: 'USA', languages: ['English', 'Arabic'] },
  { fullName: 'Jarred Stancil', dateOfBirth: '1994-06-13', startDate: '2025-04-25', vrRate: 'VR2', gender: 'Male', country: 'USA', languages: ['English'] },
  { fullName: 'Jasmín Luana', dateOfBirth: '2002-09-07', startDate: '2025-04-26', vrRate: 'VR1', gender: 'Female', country: 'Argentina', languages: ['Spanish', 'English'] },
  { fullName: 'Laura Petrone', dateOfBirth: '1996-12-20', startDate: '2024-12-16', vrRate: 'VR1', gender: 'Female', country: 'Italy', languages: ['Italian', 'English'] },
  { fullName: 'Lucia Lara', dateOfBirth: '2000-06-05', startDate: '2025-05-05', vrRate: 'VR1', gender: 'Female', country: 'Mexico', languages: ['Spanish', 'English'] },
  { fullName: 'Marieta Zderic', dateOfBirth: '1999-09-04', startDate: '2024-10-01', vrRate: 'VR2', gender: 'Female', country: 'Croatia', languages: ['Croatian', 'English'] },
  { fullName: 'Michael Hansen', dateOfBirth: '1987-12-31', startDate: '2024-10-01', vrRate: 'VR2', gender: 'Male', country: 'Denmark', languages: ['Danish', 'English'] },
  { fullName: 'Paola Tunarosa', dateOfBirth: '2003-03-27', startDate: '2025-05-16', vrRate: 'VR1', gender: 'Female', country: 'Italy', languages: ['Italian', 'English'] },
  { fullName: 'Rachel Ogimont', dateOfBirth: '2001-08-09', startDate: '2025-06-28', vrRate: 'VR1', gender: 'Female', country: 'France', languages: ['French', 'English'] },
  { fullName: 'Robin Schindfessel', dateOfBirth: '2001-03-10', startDate: '2025-01-20', vrRate: 'VR1', gender: 'Male', country: 'Germany', languages: ['German', 'English'] },
  { fullName: 'Roksana Owczarek', dateOfBirth: '2003-09-02', startDate: '2023-06-20', vrRate: 'VR2', gender: 'Female', country: 'Poland', languages: ['Polish', 'English'] },
  { fullName: 'Sophie Pietrzok', dateOfBirth: '2000-07-11', startDate: '2023-06-12', vrRate: 'VR2', gender: 'Female', country: 'Poland', languages: ['Polish', 'English', 'German'] },
  { fullName: 'Tiana Dusil', dateOfBirth: '1999-09-04', startDate: '2025-09-04', vrRate: 'VR1', gender: 'Female', country: 'Austria', languages: ['German', 'English'] },
  { fullName: 'Zachary Owens', dateOfBirth: '1996-06-03', startDate: '2024-11-02', vrRate: 'VR2', gender: 'Male', country: 'USA', languages: ['English'] },
];

/**
 * Transform raw data into Employee objects
 */
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
    vrRate: data.vrRate as VRRate,
    gender: data.gender as Gender,
    country: data.country,
    role: 'Employee',
    languages: data.languages,
    performanceRating: 3,
    status: 'Active',
    customFields: {},
  };
});
