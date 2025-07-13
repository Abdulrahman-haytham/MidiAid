// src/core/jobs/orderTimeout.job.js
const cron = require('node-cron');
const emergencyOrderService = require('../../modules/emergencyOrder/emergencyorder.service');

// جدولة المهمة لتعمل كل دقيقة
const scheduleOrderTimeoutCheck = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running task: Checking for timed out emergency orders...');
    try {
      await emergencyOrderService.processOrderTimeouts();
    } catch (err) {
      console.error('Error during scheduled order timeout check:', err.message);
    }
  });
};

module.exports = { scheduleOrderTimeoutCheck };