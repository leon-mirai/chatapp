const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

chai.use(chaiHttp);
const { expect } = chai;

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

let app;

describe('Static Files', () => {
  const sampleImagePath = path.join(__dirname, '../uploads/sample-image.jpg');

  // before each test, set up the express app and create a test image
  beforeEach(async () => {
    app = express();
    app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

    // create a mock image file for the test with minimal JPEG data
    const jpegData = Buffer.from([
      0xff, 0xd8, 0xff // JPEG SOI marker
    ]);

    await writeFile(sampleImagePath, jpegData);
  });

  // clean up the test image after each test
  afterEach(async () => {
    if (fs.existsSync(sampleImagePath)) {
      await unlink(sampleImagePath);
    }
  });

  it('should serve static files from /uploads', (done) => {
    chai.request(app)
      .get('/uploads/sample-image.jpg')
      .end((err, res) => {
        if (err) return done(err);
        expect(res).to.have.status(200);
        expect(res).to.have.header('content-type', /^image\/jpeg/);
        done();
      });
  });
});
