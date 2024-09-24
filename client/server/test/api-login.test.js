// test/api-login.test.js
const chai = require('chai');
const sinon = require('sinon');
const chaiHttp = require('chai-http');
const express = require('express');
const { route } = require('../routes/api-login');

chai.use(chaiHttp);
const { expect } = chai;

let app, db;

before(() => {
  // Create mock Express app
  app = express();
  app.use(express.json());

  // Mock the database object with Sinon
  db = {
    collection: sinon.stub().returns({
      findOne: sinon.stub(),
    }),
  };

  // Apply routes with mocked db
  route(app, db);
});

describe('POST /api/auth', () => {
  it('should return 401 when no user is found', async () => {
    // Mock findOne to return null, simulating "user not found"
    db.collection().findOne.resolves(null);

    const res = await chai.request(app)
      .post('/api/auth')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res).to.have.status(401);
    expect(res.body).to.have.property('message', 'Invalid username or password');
  });
});
