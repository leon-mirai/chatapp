const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

let app;

describe('Static Files', () => {
  const sampleImagePath = path.join(__dirname, '../uploads/sample-image.jpg');

  // Before each test, set up the express app and create a test image
  beforeEach(async () => {
    app = express();
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // Create a mock image file for the test. jpeg hexadecimals
    const jpegData = Buffer.from([
      0xff
    ]);  

    await writeFile(sampleImagePath, jpegData); // Write mock JPEG content
  });

  // Clean up the test image after each test
  afterEach(async () => {
    if (fs.existsSync(sampleImagePath)) {
      await unlink(sampleImagePath);
    }
  });

  it('should serve static files from /uploads', (done) => {
    request(app)
      .get('/uploads/sample-image.jpg')  // Ensure the file is served
      .expect('Content-Type', /image\/jpeg/)  // Expect correct content type for JPEG
      .expect(200, done);
  });
});
