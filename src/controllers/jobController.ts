import Debug from 'debug';
import mongoose from 'mongoose';
import schedule from 'node-schedule';
import Job from '../db/models/job';
const debug = Debug('Job Controller:');
///////// helper funcitons
export async function createJobHelper(job, task, saveInDb: boolean) {
  if (saveInDb) {
    const newJob = new Job(job);
    await newJob.save();
  }
  schedule.scheduleJob(job.property, job.fireTime, async realFireTime => {
    const jobInFireTime = await Job.findOne({
      property: job.property,
      type: job.type
    });
    Job.deleteOne({
      property: job.property,
      type: job.type
    }).exec();
    if (
      jobInFireTime &&
      Math.abs(
        new Date(jobInFireTime.fireTime).getTime() - realFireTime.getTime()
      ) < 5000 &&
      (!jobInFireTime.processOwner ||
        jobInFireTime.processOwner.toString() == process.env.NODE_APP_INSTANCE)
    ) {
      task(job.property)
        .then(() => {
          debug('task done');
        })
        .catch(() => {
          debug('error in doing task');
        });
    }
  });
  return 1;
}

export async function deleteJobHelper(propery, type) {
  const res = await Job.deleteOne({ propery, type });
  schedule.cancelJob(propery);
  return res.deletedCount;
}
///////// end of helper functions/

export function getJobs(req, res) {
  Job.find((err, jobs) => {
    if (err) {
      return res.sendStatus(500);
    }
    return res.status(200).send(jobs);
  });
}

export function getJob(req, res) {
  Job.findById(req.params.id, (err, job) => {
    if (err) {
      return res.sendStatus(500);
    }
    return res.status(200).send(job);
  });
}

export function createJob(req, res) {}

export function updateJob(req, res) {}

export function deleteJob(req, res) {}
