import './Schedule.css';

function Schedule() {
  return (
    <div className="Calendar">
      <iframe 
        src="https://calendar.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;ctz=Asia%2FJerusalem&amp;src=MG90N2RuNTBkajd0cGo4ZTl0MW9qZmcyZmtAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;color=%23D50000&amp;showTitle=0&amp;showNav=1&amp;showDate=1&amp;showPrint=0&amp;showTabs=1&amp;showTz=1"
        style={{ borderWidth:0 }} 
        width="800" 
        height="600" 
        frameBorder="0" 
        scrolling="no"
        title="calendar">
      </iframe>
    </div>
  );
}

export default Schedule;
