import express from 'express';
import puppeteer from 'puppeteer';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Function to filter out rows where the subjectName is purely numeric.
function cleanAttendanceData(data) {
  return data.filter(item => !/^\d+$/.test(item.subjectName));
}

// Function to update the serial numbers sequentially.
function updateSerialNumbers(data) {
  return data.map((item, index) => ({
    ...item,
    slNo: (index + 1).toString(),
  }));
}

app.post('/scrape-attendance', async (req, res) => {
  let { username, password } = req.body;
  
  if (!username || !password) {
    username = "2023UGCS120";
    password = "9845920244";
  }

  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    await page.goto('https://online.nitjsr.ac.in/endsem/Login.aspx', { 
      waitUntil: 'domcontentloaded', 
      timeout: 5000 
    });

    await page.waitForSelector('#txtuser_id');
    await page.type('#txtuser_id', username);
    await page.type('#txtpassword', password);

    await Promise.all([
      page.click('#btnsubmit'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 })
    ]);

    await page.goto('https://online.nitjsr.ac.in/endsem/StudentAttendance/ClassAttendance.aspx', { 
      waitUntil: 'networkidle2', 
      timeout: 5000 
    });

    await page.waitForSelector('table.table');

    const attendanceData = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table.table tr:not(:first-child)'));
      let currentIndex = 1;
      const cleanText = (text) => text?.trim().split('\n')[0].trim() || '';

      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 6) return null;
        
        return {
          slNo: (currentIndex++).toString(),
          subjectCode: cleanText(cells[1]?.innerText),
          subjectName: cleanText(cells[2]?.innerText),
          facultyName: cleanText(cells[3]?.innerText),
          presentTotal: cleanText(cells[4]?.innerText),
          attendancePercentage: cleanText(cells[5]?.innerText),
        };
      }).filter(Boolean);
    });

    // First, filter out rows where subjectName is purely numeric.
    const cleanedData = cleanAttendanceData(attendanceData);
    // Now, update the serial numbers sequentially.
    const finalData = updateSerialNumbers(cleanedData);

    await browser.close();
    res.json(finalData);

  } catch (error) {
    await browser.close();
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
