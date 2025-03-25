import React, { useState, useRef, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, isBefore, compareAsc, subDays } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { createEvents } from 'ics';

const allSubjects = [
  'Maths', 'English Language', 'English Literature', 'Biology', 'Chemistry', 'Physics',
  'Geography', 'History', 'French', 'Spanish',
  'Business', 'Automotive', 'Religious Studies', 'Music',
  'Food Tech', 'Health and Social', 'IT', 'Construction', 'Statistics',
  'Sport', 'Design Technology', 'Media Studies', 'Hospitality & Catering'
];

const examTimes = {
  '2025-05-06': [
    { subject: 'Health and Social', time: '09:00' },
    { subject: 'Construction', time: '14:00' }
  ],
  '2025-05-09': [
    { subject: 'Business', time: '14:00' }
  ],
  '2025-05-12': [
    { subject: 'English Literature', time: '09:00' }
  ],
  '2025-05-13': [
    { subject: 'Religious Studies', time: '09:00' },
    { subject: 'Biology', time: '14:00' }
  ],
  '2025-05-14': [
    { subject: 'Geography', time: '09:00' },
    { subject: 'Media Studies', time: '14:00' }
  ],
  '2025-05-15': [
    { subject: 'Maths', time: '09:00' }
  ],
  '2025-05-16': [
    { subject: 'History', time: '09:00' },
    { subject: 'Business', time: '14:00' }
  ],
  '2025-05-19': [
    { subject: 'Chemistry', time: '09:00' }
  ],
  '2025-05-20': [
    { subject: 'English Literature', time: '09:00' }
  ],
  '2025-05-21': [
    { subject: 'French', time: '09:00' },
    { subject: 'Religious Studies', time: '14:00' }
  ],
  '2025-05-22': [
    { subject: 'Physics', time: '09:00' },
    { subject: 'Media Studies', time: '14:00' },
    { subject: 'Sport', time: '14:00' }
  ],
  '2025-05-23': [
    { subject: 'English Language', time: '09:00' }
  ],
  '2025-06-02': [
    { subject: 'Statistics', time: '09:00' },
    { subject: 'Automotive', time: '14:00' }
  ],
  '2025-06-04': [
    { subject: 'Maths', time: '09:00' }
  ],
  '2025-06-05': [
    { subject: 'History', time: '09:00' },
    { subject: 'French', time: '14:00' }
  ],
  '2025-06-06': [
    { subject: 'English Language', time: '09:00' },
    { subject: 'Geography', time: '14:00' }
  ],
  '2025-06-09': [
    { subject: 'Biology', time: '09:00' },
    { subject: 'IT', time: '14:00' }
  ],
  '2025-06-10': [
    { subject: 'Spanish', time: '09:00' },
    { subject: 'History', time: '14:00' }
  ],
  '2025-06-11': [
    { subject: 'Maths', time: '09:00' }
  ],
  '2025-06-12': [
    { subject: 'Geography', time: '09:00' },
    { subject: 'Hospitality & Catering', time: '14:00' }
  ],
  '2025-06-13': [
    { subject: 'Chemistry', time: '09:00' },
    { subject: 'Statistics', time: '14:00' }
  ],
  '2025-06-16': [
    { subject: 'Physics', time: '09:00' }
  ],
  '2025-06-17': [
    { subject: 'Spanish', time: '09:00' }
  ],
  '2025-06-18': [
    { subject: 'Design Technology', time: '09:00' }
  ]
};

const examEvents = Object.entries(examTimes).flatMap(([date, exams]) =>
  exams
    .filter(e => selectedSubjects.includes(e.subject))
    .map(e => ({
      title: `${e.subject} Exam – ${e.time}`,
      date,
      time: e.time,
      color: '#FF5733'
    }))
);

const exportICS = () => {
  const allEvents = [...examEvents, ...revisionEvents].map(e => {
    const [year, month, day] = e.date.split('-').map(Number);
    const [hour, minute] = (e.time || '09:00').split(':').map(Number);
    return {
      start: [year, month, day, hour, minute],
      duration: { hours: 1 },
      title: e.title,
      status: 'CONFIRMED'
    };
  });

  createEvents(allEvents, (error, value) => {
    if (error) return console.error(error);
    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gcse-timetable.ics';
    a.click();
  });
};
