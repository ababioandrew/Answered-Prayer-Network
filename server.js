import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// =====================================================
// ENVIRONMENT VARIABLES
// =====================================================

const requiredEnv = [
  'DB_USER',
  'DB_HOST',
  'DB_NAME',
  'DB_PASS',
  'DB_PORT',
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    process.exit(1);
  }
}

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// =====================================================
// COMMERCIAL CONFIGURATION
// =====================================================

app.get('/api/commercial', (req, res) => {
  res.status(200).json({
    success: true,
    enabled: true,

    // This is configuration only.
    // The actual video is imported by Home.jsx.
    videoUrl: '/src/assets/videos/commercial.mp4',

    duration: 10,

    triggers: [
      5,
      10,
      15,
    ],
  });
});

// =====================================================
// POSTGRESQL
// =====================================================

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: Number(process.env.DB_PORT) || 5432,
});

// =====================================================
// CREATE MEMBERS TABLE
// =====================================================

const createMembersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        "fullName" VARCHAR(100) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        location VARCHAR(100),
        "dateOfBirth" DATE,
        "dateOfEntry" DATE NOT NULL,
        contacts VARCHAR(50),
        remarks TEXT,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Members table is ready');
  } catch (error) {
    console.error(
      '❌ Failed to create members table:',
      error.message
    );

    throw error;
  }
};

// =====================================================
// DATABASE CONNECTION
// =====================================================

const connectDatabase = async () => {
  try {
    const client = await pool.connect();

    console.log('✅ PostgreSQL connected successfully');

    client.release();

    await createMembersTable();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed');
    console.error(error.message);

    throw error;
  }
};

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');

    res.status(200).json({
      success: true,
      message: 'Backend and PostgreSQL are working',
      database: process.env.DB_NAME,
    });
  } catch (error) {
    console.error('Health check error:', error);

    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL MEMBERS
// =====================================================


// =====================================================
// GET CURRENT MONTH BIRTHDAY CELEBRANTS
// =====================================================

app.get('/api/members/birthdays', async (req, res) => {
try {
const result = await pool.query(`
SELECT
id,
"fullName",
gender,
location,
"dateOfBirth",
contacts,
remarks,
EXTRACT(YEAR FROM AGE(CURRENT_DATE, "dateOfBirth"))::INTEGER AS age
FROM members
WHERE
"dateOfBirth" IS NOT NULL
AND EXTRACT(MONTH FROM "dateOfBirth")
= EXTRACT(MONTH FROM CURRENT_DATE)
ORDER BY
EXTRACT(DAY FROM "dateOfBirth") ASC,
"fullName" ASC
`);

res.status(200).json({
success: true,
month: new Date().toLocaleString('en-US', {
month: 'long',
}),
count: result.rows.length,
birthdays: result.rows,
});

} catch (error) {
console.error('GET birthday members error:', error);

res.status(500).json({
success: false,
message: 'Failed to retrieve birthday celebrants',
error: error.message,
});
}
});

app.get('/api/members', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM members
      ORDER BY id DESC
    `);

    res.status(200).json({
      success: true,
      members: result.rows,
    });
  } catch (error) {
    console.error('GET members error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =====================================================
// GET MEMBER BY ID
// =====================================================

app.get('/api/members/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT *
      FROM members
      WHERE id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.status(200).json({
      success: true,
      member: result.rows[0],
    });
  } catch (error) {
    console.error('GET member error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =====================================================
// CREATE MEMBER
// =====================================================

app.post('/api/members', async (req, res) => {
  console.log('\n=================================');
  console.log('📥 POST /api/members');
  console.log('📦 Received body:', req.body);
  console.log('=================================');

  const {
    fullName,
    gender,
    location,
    dateOfBirth,
    dateOfEntry,
    contacts,
    remarks,
  } = req.body;

  if (!fullName || !gender || !dateOfEntry) {
    console.log('❌ Required fields missing');

    return res.status(400).json({
      success: false,
      message:
        'Full name, gender and date of entry are required',
    });
  }

  try {
    const dbInfo = await pool.query(`
      SELECT current_database() AS database
    `);

    console.log(
      '🗄️ Current PostgreSQL database:',
      dbInfo.rows[0].database
    );

    console.log('📝 Inserting into table: members');

    const result = await pool.query(
      `
      INSERT INTO members (
        "fullName",
        gender,
        location,
        "dateOfBirth",
        "dateOfEntry",
        contacts,
        remarks
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        fullName.trim(),
        gender,
        location?.trim() || null,
        dateOfBirth || null,
        dateOfEntry,
        contacts?.trim() || null,
        remarks?.trim() || null,
      ]
    );

    console.log('✅ PostgreSQL INSERT successful');
    console.log('✅ Inserted member:', result.rows[0]);

    res.status(201).json({
      success: true,
      message: 'Membership details saved successfully!',
      member: result.rows[0],
    });
  } catch (error) {
    console.error('❌ PostgreSQL INSERT ERROR');
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE MEMBER
// =====================================================

app.put('/api/members/:id', async (req, res) => {
  const { id } = req.params;

  const {
    fullName,
    gender,
    location,
    dateOfBirth,
    dateOfEntry,
    contacts,
    remarks,
  } = req.body;

  if (!fullName || !gender || !dateOfEntry) {
    return res.status(400).json({
      success: false,
      message:
        'Full name, gender and date of entry are required',
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE members
      SET
        "fullName" = $1,
        gender = $2,
        location = $3,
        "dateOfBirth" = $4,
        "dateOfEntry" = $5,
        contacts = $6,
        remarks = $7,
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
      `,
      [
        fullName.trim(),
        gender,
        location || null,
        dateOfBirth || null,
        dateOfEntry,
        contacts || null,
        remarks || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member updated successfully!',
      member: result.rows[0],
    });
  } catch (error) {
    console.error('PUT member error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =====================================================
// DELETE MEMBER
// =====================================================

app.delete('/api/members/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `
      DELETE FROM members
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Member deleted successfully!',
      member: result.rows[0],
    });
  } catch (error) {
    console.error('DELETE member error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =====================================================
// SEND ENQUIRY
// =====================================================

app.post('/api/send-enquiry', async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message is required',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: 'New Enquiry from Chatbot',
      text: message.trim(),
    });

    res.status(200).json({
      success: true,
      message: 'Enquiry sent successfully',
    });
  } catch (error) {
    console.error('Email error:', error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// =====================================================
// 404
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// =====================================================
// START SERVER
// =====================================================

const server = app.listen(PORT, async () => {
  console.log(
    `✅ Server running on http://localhost:${PORT}`
  );

  console.log(
    `✅ Health check: http://localhost:${PORT}/api/health`
  );

  console.log(
    `🎬 Commercial API: http://localhost:${PORT}/api/commercial`
  );

  try {
    await connectDatabase();
  } catch (error) {
    console.error(
      '❌ Server startup failed:',
      error.message
    );

    server.close(() => {
      process.exit(1);
    });
  }
});

// =====================================================
// SERVER ERROR
// =====================================================

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `❌ Port ${PORT} is already in use.`
    );

    console.error(
      `Run: netstat -ano | findstr :${PORT}`
    );

    process.exit(1);
  }

  console.error('❌ Server error:', error);
});

// =====================================================
// SHUTDOWN
// =====================================================

const shutdown = async () => {
  console.log('🛑 Shutting down server...');

  await pool.end();

  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);



// import express from 'express';
// import nodemailer from 'nodemailer';
// import cors from 'cors';
// import { Pool } from 'pg';
// import dotenv from 'dotenv';

// dotenv.config();

// const app = express();
// const PORT = Number(process.env.PORT) || 5000;
// const requiredEnv = [
// 'DB_USER',
// 'DB_HOST',
// 'DB_NAME',
// 'DB_PASS',
// 'DB_PORT',
// ];

// for (const key of requiredEnv) {
// if (!process.env[key]) {
// console.error(`❌ Missing environment variable: ${key}`);
// process.exit(1);
// }
// }

// app.use(
// cors({
// origin: true,
// credentials: true,
// })
// );

// app.use(express.json());

// const pool = new Pool({
// user: process.env.DB_USER,
// host: process.env.DB_HOST,
// database: process.env.DB_NAME,
// password: process.env.DB_PASS,
// port: Number(process.env.DB_PORT) || 5432,
// });

// const createMembersTable = async () => {
// try {
// await pool.query(`
// CREATE TABLE IF NOT EXISTS members (
// id SERIAL PRIMARY KEY,
// "fullName" VARCHAR(100) NOT NULL,
// gender VARCHAR(20) NOT NULL,
// location VARCHAR(100),
// "dateOfBirth" DATE,
// "dateOfEntry" DATE NOT NULL,
// contacts VARCHAR(50),
// remarks TEXT,
// "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
// "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// )
// `);

// console.log('✅ Members table is ready');
// } catch (error) {
// console.error(
// '❌ Failed to create members table:',
// error.message
// );

// throw error;
// }
// };

// const connectDatabase = async () => {
// try {
// const client = await pool.connect();

// console.log('✅ PostgreSQL connected successfully');

// client.release();

// await createMembersTable();
// } catch (error) {
// console.error('❌ PostgreSQL connection failed');
// console.error(error.message);

// throw error;
// }
// };

// app.get('/api/health', async (req, res) => {
// try {
// await pool.query('SELECT NOW()');

// res.status(200).json({
// success: true,
// message: 'Backend and PostgreSQL are working',
// database: process.env.DB_NAME,
// });
// } catch (error) {
// console.error('Health check error:', error);

// res.status(500).json({
// success: false,
// message: 'Database connection failed',
// error: error.message,
// });
// }
// });

// app.get('/api/members', async (req, res) => {
// try {
// const result = await pool.query(`
// SELECT *
// FROM members
// ORDER BY id DESC
// `);

// res.status(200).json({
// success: true,
// members: result.rows,
// });
// } catch (error) {
// console.error('GET members error:', error);

// res.status(500).json({
// success: false,
// error: error.message,
// });
// }
// });

// app.get('/api/members/:id', async (req, res) => {
// const { id } = req.params;

// try {
// const result = await pool.query(
// `
// SELECT *
// FROM members
// WHERE id = $1
// `,
// [id]
// );

// if (result.rows.length === 0) {
// return res.status(404).json({
// success: false,
// message: 'Member not found',
// });
// }

// res.status(200).json({
// success: true,
// member: result.rows[0],
// });
// } catch (error) {
// console.error('GET member error:', error);

// res.status(500).json({
// success: false,
// error: error.message,
// });
// }
// });

// app.post('/api/members', async (req, res) => {
//   console.log('\n=================================');
//   console.log('📥 POST /api/members');
//   console.log('📦 Received body:', req.body);
//   console.log('=================================');

//   const {
//     fullName,
//     gender,
//     location,
//     dateOfBirth,
//     dateOfEntry,
//     contacts,
//     remarks,
//   } = req.body;

//   if (!fullName || !gender || !dateOfEntry) {
//     console.log('❌ Required fields missing');

//     return res.status(400).json({
//       success: false,
//       message: 'Full name, gender and date of entry are required',
//     });
//   }

//   try {
//     // Check which PostgreSQL database is being used
//     const dbInfo = await pool.query(`
//       SELECT current_database() AS database
//     `);

//     console.log(
//       '🗄️ Current PostgreSQL database:',
//       dbInfo.rows[0].database
//     );

//     console.log('📝 Inserting into table: members');

//     const result = await pool.query(
//       `
//       INSERT INTO members (
//         "fullName",
//         gender,
//         location,
//         "dateOfBirth",
//         "dateOfEntry",
//         contacts,
//         remarks
//       )
//       VALUES ($1, $2, $3, $4, $5, $6, $7)
//       RETURNING *
//       `,
//       [
//         fullName.trim(),
//         gender,
//         location?.trim() || null,
//         dateOfBirth || null,
//         dateOfEntry,
//         contacts?.trim() || null,
//         remarks?.trim() || null,
//       ]
//     );

//     console.log('✅ PostgreSQL INSERT successful');
//     console.log('✅ Inserted member:', result.rows[0]);

//     res.status(201).json({
//       success: true,
//       message: 'Membership details saved successfully!',
//       member: result.rows[0],
//     });

//   } catch (error) {
//     console.error('❌ PostgreSQL INSERT ERROR');
//     console.error(error);

//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });

// app.put('/api/members/:id', async (req, res) => {
// const { id } = req.params;

// const {
// fullName,
// gender,
// location,
// dateOfBirth,
// dateOfEntry,
// contacts,
// remarks,
// } = req.body;

// if (!fullName || !gender || !dateOfEntry) {
// return res.status(400).json({
// success: false,
// message:
// 'Full name, gender and date of entry are required',
// });
// }

// try {
// const result = await pool.query(
// `
// UPDATE members
// SET
// "fullName" = $1,
// gender = $2,
// location = $3,
// "dateOfBirth" = $4,
// "dateOfEntry" = $5,
// contacts = $6,
// remarks = $7,
// "updatedAt" = CURRENT_TIMESTAMP
// WHERE id = $8
// RETURNING *
// `,
// [
// fullName.trim(),
// gender,
// location || null,
// dateOfBirth || null,
// dateOfEntry,
// contacts || null,
// remarks || null,
// id,
// ]
// );

// if (result.rows.length === 0) {
// return res.status(404).json({
// success: false,
// message: 'Member not found',
// });
// }

// res.status(200).json({
// success: true,
// message: 'Member updated successfully!',
// member: result.rows[0],
// });
// } catch (error) {
// console.error('PUT member error:', error);

// res.status(500).json({
// success: false,
// error: error.message,
// });
// }
// });

// app.delete('/api/members/:id', async (req, res) => {
// const { id } = req.params;

// try {
// const result = await pool.query(
// `
// DELETE FROM members
// WHERE id = $1
// RETURNING *
// `,
// [id]
// );

// if (result.rows.length === 0) {
// return res.status(404).json({
// success: false,
// message: 'Member not found',
// });
// }

// res.status(200).json({
// success: true,
// message: 'Member deleted successfully!',
// member: result.rows[0],
// });
// } catch (error) {
// console.error('DELETE member error:', error);

// res.status(500).json({
// success: false,
// error: error.message,
// });
// }
// });

// app.post('/api/send-enquiry', async (req, res) => {
// const { message } = req.body;

// if (!message || !message.trim()) {
// return res.status(400).json({
// success: false,
// message: 'Message is required',
// });
// }

// try {
// const transporter = nodemailer.createTransport({
// service: 'gmail',
// auth: {
// user: process.env.EMAIL_USER,
// pass: process.env.EMAIL_PASS,
// },
// });

// await transporter.sendMail({
// from: process.env.EMAIL_USER,
// to: process.env.EMAIL_TO || process.env.EMAIL_USER,
// subject: 'New Enquiry from Chatbot',
// text: message.trim(),
// });

// res.status(200).json({
// success: true,
// message: 'Enquiry sent successfully',
// });
// } catch (error){console.error('Email error:', error);
// res.status(500).json({
// success: false,
// error: error.message,
// });
// }
// });

// app.use((req, res) => {
// res.status(404).json({
// success: false,
// message: 'Route not found',
// });
// });

// const server = app.listen(PORT, async () => {
// console.log(`✅ Server running on http://localhost:${PORT}`);
// console.log(`✅ Health check: http://localhost:${PORT}/api/health`);

// try {
// await connectDatabase();
// }catch (error){console.error('❌ Server startup failed:', error.message);
// server.close(() => {
// process.exit(1);
// });
// }
// });

// server.on('error', (error) => {
// if (error.code === 'EADDRINUSE') {
// console.error(`❌ Port ${PORT} is already in use.`);
// console.error(
// `Run: netstat -ano | findstr :${PORT}`
// );
// process.exit(1);
// }
// console.error('❌ Server error:', error);
// });

// const shutdown = async () => {
// console.log('🛑 Shutting down server...');
// await pool.end();

// server.close(() => {
// console.log('✅ Server stopped');
// process.exit(0);
// });
// };

// process.on('SIGINT', shutdown);
// process.on('SIGTERM', shutdown);