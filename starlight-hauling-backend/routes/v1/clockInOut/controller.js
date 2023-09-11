import httpStatus from 'http-status';
import ClockInOutRepository from '../../../repos/clockInOut.js';

export const clockIn = async ctx => {
  const { id } = ctx.state.user;
  const data = { userId: id, clockIn: new Date().toUTCString() };
  const newClockInOut = await ClockInOutRepository.getInstance(ctx.state).createOne({
    data,
  });
  ctx.status = httpStatus.CREATED;
  ctx.body = newClockInOut;
};

export const clockOut = async ctx => {
  const { id } = ctx.request.validated.body;
  const data = { clockOut: new Date().toUTCString() };

  const updatedClockInOut = await ClockInOutRepository.getInstance(ctx.state).updateBy({
    condition: { id },
    data,
  });

  ctx.status = httpStatus.OK;
  ctx.body = updatedClockInOut;
};

export const getCurrent = async ctx => {
  const { id } = ctx.state.user;
  const currentClockInOut = await ClockInOutRepository.getInstance(ctx.state).getBy({
    condition: { userId: id, clockOut: null },
  });
  ctx.status = httpStatus.OK;
  ctx.body = currentClockInOut;
};
