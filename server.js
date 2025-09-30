const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.post('/send-contact', async (req, res) => {
  const { name, email, message } = req.body;
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'alienssoft.tech@gmail.com',
      pass: 'oxjd jsmc bzeh tdsq' // Use an App Password, not your main password
    }
  });
  let mailOptions = {
    from: 'alienssoft.tech@gmail.com',
    to: 'alienssoft.tech@gmail.com',
    replyTo: email,
    subject: `Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };
  try {
    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MARASSI Logistics server running on http://localhost:${PORT}`);
});