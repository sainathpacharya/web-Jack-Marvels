import React, { useMemo } from 'react';

function groupStudents(students) {
  return students.reduce((acc, student) => {
    const className = student.className || 'Unknown Class';
    const section = student.section || 'No Section';
    if (!acc[className]) acc[className] = {};
    if (!acc[className][section]) acc[className][section] = [];
    acc[className][section].push(student);
    return acc;
  }, {});
}

export default function ClassSectionAccordion({ students = [] }) {
  const grouped = useMemo(() => groupStudents(students), [students]);
  const classKeys = Object.keys(grouped).sort();

  if (classKeys.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-sky-100 bg-white p-4">
      <h2 className="text-sm font-semibold text-sky-900">Class / Section View</h2>
      <div className="mt-3 space-y-2">
        {classKeys.map((className) => {
          const sections = Object.keys(grouped[className]).sort();
          const classCount = sections.reduce((sum, sec) => sum + grouped[className][sec].length, 0);
          return (
            <details key={className} className="rounded-lg border border-sky-100 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-sky-900">
                Class {className} ({classCount})
              </summary>
              <div className="mt-3 space-y-2">
                {sections.map((section) => (
                  <details key={`${className}-${section}`} className="rounded-md border border-sky-50 p-2">
                    <summary className="cursor-pointer text-sm text-gray-800">
                      Section {section} ({grouped[className][section].length})
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {grouped[className][section].map((student) => (
                        <li key={student.id} className="text-sm text-gray-700">
                          {student.name} - {student.mobileNumber || 'No mobile'}
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
