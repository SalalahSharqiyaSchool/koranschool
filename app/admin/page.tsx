"use client"

import { useEffect, useState } from 'react';
import Sidebar from '@/components/sidebar';
import { initializeData, Groups } from '@/lib/storage';
import { Button } from '@/components/ui/button';

interface Class {
  classId: string;
  className: string;
  students: string[];
}

export default function AdminDashboard() {
  const [groups, setGroups] = useState<Groups>({});
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B'>('B');
  const [newClassName, setNewClassName] = useState('');
  const [editingStudent, setEditingStudent] = useState<{group: string, classId: string, studentId: string, name: string} | null>(null);

  useEffect(() => {
    const data = initializeData();
    setGroups(data.groups);
  }, []);

  const addClass = () => {
    if (!newClassName.trim()) return;
    
    const newClassId = selectedGroup === 'B' ? `B${Object.keys(groups[selectedGroup] || []).length + 1}` : `A${Object.keys(groups.A || []).length + 1}`;
    const newClass: Class = {
      classId: newClassId,
      className: newClassName,
      students: []
    };

    setGroups(prev => ({
      ...prev,
      [selectedGroup]: [...(prev[selectedGroup] || []), newClass]
    }));

    setNewClassName('');
  };

  const addStudent = (classId: string) => {
    // Implementation using storage lib
    console.log('Add student to', classId);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">لوحة الإدارة</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">إدارة الفصول والطلاب</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Groups Selector */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold mb-6">إضافة فصل جديد</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    المجموعة
                  </label>
                  <select 
                    value={selectedGroup} 
                    onChange={(e) => setSelectedGroup(e.target.value as 'A' | 'B')}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="A">مجموعة أ</option>
                    <option value="B">مجموعة ب</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <input
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="اسم الفصل الجديد"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <Button onClick={addClass} className="px-6">
                    إضافة
                  </Button>
                </div>
              </div>
            </div>

            {/* Groups Tree */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 overflow-auto max-h-96">
              <h3 className="text-xl font-bold mb-4">الفصول</h3>
              <div className="space-y-3">
                {Object.entries(groups).map(([groupName, classes]) => (
                  <div key={groupName} className="space-y-2">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      مجموعة {groupName}
                      ({classes.length} فصل)
                    </h4>
                    <div className="space-y-1">
                      {classes.map((cls: Class) => (
                        <div key={cls.classId} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                          <span className="font-medium text-gray-900 dark:text-white mr-3">
                            {cls.className}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 mr-auto">
                            ({cls.students.length} طالب)
                          </span>
                          <Button variant="outline" size="sm" onClick={() => addStudent(cls.classId)}>
                            إضافة طالب
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
