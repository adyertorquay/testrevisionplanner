
import React, { useState, useRef } from 'react';
import { format, parseISO, eachDayOfInterval, isBefore, subDays, compareAsc } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { createEvents } from 'ics';

const subjects = ['Maths', 'Construction', 'Biology', 'Business'];

const examDates = {
  Maths: ['2025-05-14', '2025-06-03'],
  Construction: ['2025-05-06'],
  Biology: ['2025-05-13'],
  Business: ['2025-05-09', '2025-05-16']
};

const examTimes = {
  '2025-05-06': '09:00',
  '2025-05-09': '13:30',
  '2025-05-13': '09:00',
  '2025-05-14': '09:00',
  '2025-05-16': '09:00',
  '2025-06-03': '09:00'
};

function App() {
  const calendarRef = useRef();
  const [selectedSubjects, setSelectedSubjects] = useState(subjects);
  const [availability] = useState({
    Monday: ['09:00', '10:00'],
    Tuesday: ['09:00', '10:00'],
    Wednesday: ['09:00', '10:00'],
    Thursday: ['09:00', '10:00'],
    Friday: ['09:00', '10:00'],
    Saturday: ['09:00'],
    Sunday: ['09:00']
  });

  const startDate = new Date('2025-04-04');
  const endDate = new Date('2025-07-19');
  const intensiveStart = new Date('2025-04-22');

  const generateEvents = () => {
    const allDays = eachDayOfInterval({ start: startDate, end: endDate });
    const events = [];
    const sessionMap = {};

    allDays.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayName = format(day, 'EEEE');
      sessionMap[dateStr] = [];
      availability[dayName]?.forEach(time => {
        sessionMap[dateStr].push({ time, used: false });
      });
    });

    const schedule = selectedSubjects.map(subject => {
      const exams = examDates[subject].map(parseISO);
      return { subject, exams, finalExam: exams[exams.length - 1] };
    }).sort((a, b) => compareAsc(a.finalExam, b.finalExam));

    // Day-before revision
    schedule.forEach(({ subject, exams }) => {
      exams.forEach(examDate => {
        const prevDay = format(subDays(examDate, 1), 'yyyy-MM-dd');
        const slots = sessionMap[prevDay] || [];
        const slot = slots.find(s => !s.used);
        if (slot) {
          slot.used = true;
          events.push({ title: `Revise ${subject}`, date: prevDay, time: slot.time, color: '#1E40AF' });
        }
      });
    });

    // General revision
    allDays.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      const slots = sessionMap[key];
      if (!slots?.length) return;

      const isEarly = isBefore(day, intensiveStart);
      for (let slot of slots) {
        if (slot.used) continue;

        const subjectsPool = isEarly ? selectedSubjects : schedule
          .filter(s => s.exams.some(d => isBefore(day, d)))
          .map(s => s.subject);

        for (let subj of subjectsPool) {
          const already = events.find(e => e.date === key && e.title === `Revise ${subj}`);
          if (!already) {
            events.push({ title: `Revise ${subj}`, date: key, time: slot.time, color: '#3B82F6' });
            slot.used = true;
            break;
          }
        }
      }
    });

    // Exams
    selectedSubjects.forEach(subject => {
      (examDates[subject] || []).forEach(date => {
        const time = examTimes[date] || '09:00';
        events.push({ title: `${subject} Exam – ${time}`, date, time, color: '#FF5733' });
      });
    });

    return events;
  };

  const events = generateEvents();

  const exportICS = () => {
    const icsEvents = events.map(e => {
      const [year, month, day] = e.date.split('-').map(Number);
      const [hour, minute] = (e.time || '09:00').split(':').map(Number);
      return {
        start: [year, month, day, hour, minute],
        duration: { hours: 1 },
        title: e.title,
        status: 'CONFIRMED'
      };
    });
    createEvents(icsEvents, (error, value) => {
      if (error) return console.log(error);
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'gcse-timetable.ics';
      a.click();
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📘 GCSE Planner</h1>
      <button onClick={exportICS} className="bg-blue-500 text-white px-4 py-2 rounded mb-4">Export .ICS</button>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        height={650}
        ref={calendarRef}
      />
    </div>
  );
}

export default App;
