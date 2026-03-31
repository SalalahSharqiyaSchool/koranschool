"use client"

import { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import { Groups } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherDashboard() {
  const [groups, setGroups] = useState<Groups>({});
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B'>('B');
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    const data = getData();
    setGroups(data.groups);
  }, []);

  const markAttendance = () => {
    console.log('Mark attendance for', selectedClass);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-3xl">تسجيل الحضور</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">المجموعة</label>
                  <select 
                    value={selectedGroup} 
                    onChange={(e) => setSelectedGroup(e.target.value as 'A' | 'B')}
                    className="w-full p-3 border rounded-xl"
                  >
                    <option value="B">مجموعة ب</option>
                    <option value="A">مجموعة أ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الفصل</label>
                  <select 
                    value={selectedClass} 
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full p-3 border rounded-xl"
                  >
                    <option>اختر الفصل</option>
                    {(groups[selectedGroup] || []).map((cls) => (
                      <option key={cls.classId} value={cls.classId}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={markAttendance}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-lg"
                disabled={!selectedClass}
              >
                حفظ الحضور
              </Button>
            </CardContent>
          </Card>

          {/* Students list when class selected */}
          {selectedClass && (
            <Card>
              <CardHeader>
                <CardTitle>قائمة الطلاب</CardTitle>
              </CardHeader>
              <CardContent>
                <p>طلاب الفصل: {students.length}</p>
                {/* Attendance checkboxes */}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
