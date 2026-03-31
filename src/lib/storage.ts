interface Student {
  id: string;
  name: string;
}

interface Class {
  classId: string;
  className: string;
  students: Student[];
}

interface Groups {
  [group: string]: Class[];
}

interface AttendanceRecord {
  date: string;
  group: string;
  classId: string;
  students: Array<{name: string; present: boolean}>;
}

const DATA_KEY = 'school-data-v1';

export function getData(): {groups: Groups; attendance: AttendanceRecord[]} | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const dataStr = localStorage.getItem(DATA_KEY);
  if (!dataStr) return null;
  
  try {
    return JSON.parse(dataStr);
  } catch {
    return null;
  }
}

export function saveData(data: {groups: Groups; attendance: AttendanceRecord[]}) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  }
}

export function initializeData() {
  const data = getData();
  if (!data || Object.keys(data.groups).length === 0) {
    const initialGroups: Groups = {
      B: [
        { classId: "B1", className: "السيدة خديجة الكبرى", students: [] },
        { classId: "B2", className: "السيدة فاطمة الزهراء", students: [] },
        { classId: "B3", className: "السيدة زينب", students: [] },
        { classId: "B4", className: "السيدة رقية", students: [] },
        { classId: "B5", className: "رياحين الجنة", students: [] },
        { classId: "B6", className: "نور الرحمن", students: [] },
        { classId: "B7", className: "السيدة أسماء أبي بكر", students: [] },
        { classId: "B8", className: "السيدة أم كلثوم", students: [] },
        { classId: "B9", className: "السيدة أم سلمة", students: [] },
        { classId: "B10", className: "السيدة عائشة الرضى", students: [] },
        { classId: "B11", className: "السيدة حفصة بنت عمر", students: [] }
      ],
      A: []
    };
    
    saveData({groups: initialGroups, attendance: []});
    return {groups: initialGroups, attendance: []};
  }
  return data;
}

export function addStudent(group: string, classId: string, studentName: string) {
  const data = getData();
  if (!data.groups[group]?.find(c => c.classId === classId)) return;
  
  const studentId = Date.now().toString();
  const student: Student = { id: studentId, name: studentName };
  
  const classIndex = data.groups[group].findIndex(c => c.classId === classId);
  data.groups[group][classIndex].students.push(student);
  
  saveData(data);
}

export function deleteStudent(group: string, classId: string, studentId: string) {
  const data = getData();
  const classIndex = data.groups[group].findIndex(c => c.classId === classId);
  if (classIndex === -1) return;
  
  data.groups[group][classIndex].students = data.groups[group][classIndex].students.filter(s => s.id !== studentId);
  saveData(data);
}

export function updateStudent(group: string, classId: string, studentId: string, newName: string) {
  const data = getData();
  const classIndex = data.groups[group].findIndex(c => c.classId === classId);
  if (classIndex === -1) return;
  
  const studentIndex = data.groups[group][classIndex].students.findIndex(s => s.id === studentId);
  if (studentIndex !== -1) {
    data.groups[group][classIndex].students[studentIndex].name = newName;
    saveData(data);
  }
}

// Add more functions as needed
