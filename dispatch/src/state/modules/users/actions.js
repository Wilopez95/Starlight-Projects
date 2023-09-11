import { toast } from '@root/components/Toast';

import { authApiService } from '@root/helpers/apiService';
// import type {
//   UsersType,
//   UpdateUserInput,
//   ThunkAction,
//   CreateUserRes,
//   CreateUserInput,
//   RoleInputValue,
//   UUID,
//   UserType,
// } from 'types/index';
import { user as userSchema } from '../../schema';
import * as t from './actionTypes';

/**
 * ===========================================================================
 * FETCH USERS
 * ===========================================================================
 */

export const fetchUsersReq = () => ({
  type: t.FETCH_USERS_REQUEST,
});

export function fetchUsersSuccess(users) {
  return {
    type: t.FETCH_USERS_SUCCESS,
    payload: users,
    meta: {
      schema: [userSchema],
    },
  };
}

export function fetchUsersFail(err) {
  return {
    type: t.FETCH_USERS_FAILURE,
    error: err.message || err,
  };
}

export function fetchUsers() {
  return async (dispatch) => {
    dispatch(fetchUsersReq());

    try {
      const { data } = await authApiService.get('users');
      return dispatch(fetchUsersSuccess(data));
    } catch (error) {
      dispatch(fetchUsersFail(error));
      return Promise.reject(error);
    }
  };
}

export const fetchUsersIfNeeded = () => (dispatch) =>
  // const state = getState();
  dispatch(fetchUsers());
/* istanbul ignore next */
// if (state.users.ids.length <= 0) {
//   return dispatch(fetchUsers());
// }
// return state;

/**
 * ===========================================================================
 * CREATE USER
 * ===========================================================================
 */

export const createUserReq = () => ({
  type: t.CREATE_USER_REQUEST,
});

export function createUserSuccess(data) {
  return {
    type: t.CREATE_USER_SUCCESS,
    payload: data,
    meta: {
      schema: userSchema,
    },
  };
}

export function createUserFail(err) {
  return {
    type: t.CREATE_USER_FAILURE,
    error: err.message || err,
  };
}

export const createUser = (formInput) => (dispatch) => {
  dispatch(createUserReq());
  return authApiService
    .post('users', {
      email: formInput.email,
      password: formInput.password,
      firstName: formInput.firstName,
      lastName: formInput.lastName,
      avatarUrl: formInput.avatarUrl,
      username: formInput.username,
      timezone: formInput.timezone.value,
      roleId: formInput.roleId.value,
      organizationId: formInput.organizationId,
    })
    .then((response) => {
      if (response.data.email === undefined) {
        const err = { message: 'Unable to create the user.' };
        return dispatch(createUserFail(err));
      }

      toast.success('User created', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(createUserSuccess(response.data));
    })
    .catch((err) => {
      toast.error(err.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(createUserFail(err));
    });
};

/**
 * ===========================================================================
 * UPDATE USER
 * ===========================================================================
 */

export const updateUserReq = () => ({
  type: t.UPDATE_USER_REQUEST,
});

export function updateUserSuccess(data) {
  return {
    type: t.UPDATE_USER_SUCCESS,
    payload: data,
    meta: {
      schema: userSchema,
    },
  };
}

export function updateUserFail(err) {
  return {
    type: t.UPDATE_USER_FAILURE,
    error: err.message,
  };
}

export const updateUser = (userId, formInput) => (dispatch) => {
  dispatch(updateUserReq());
  return authApiService
    .put(`users/${userId}`, {
      email: formInput.email,
      firstName: formInput.firstName,
      lastName: formInput.lastName,
      avatarUrl: formInput.avatarUrl,
      username: formInput.username,
      timezone: formInput.timezone.value,
    })
    .then((response) => {
      if (response.data.email === undefined) {
        const err = { message: 'Unable to update the user.' };
        return dispatch(updateUserFail(err));
      }

      toast.success('User updated', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(updateUserSuccess(response.data));
    })
    .catch((err) => {
      toast.error(err.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(updateUserFail(err));
    });
};
/**
 * ===========================================================================
 * UPDATE PASSWORD
 * ===========================================================================
 */

export const updatePasswordReq = () => ({
  type: t.UPDATE_PASSWORD_REQUEST,
});

export function updatePasswordSuccess(data) {
  return {
    type: t.UPDATE_PASSWORD_SUCCESS,
    message: data.message,
  };
}
export function updatePasswordFailure(err) {
  return {
    type: t.UPDATE_PASSWORD_FAILURE,
    error: err.message,
  };
}

export const updatePassword = (userId, formInput) => (dispatch) => {
  dispatch(updatePasswordReq());
  return authApiService
    .put(`users/${userId}/password`, {
      password: formInput.password,
    })
    .then((response) => {
      if (response.data.id === undefined) {
        const err = { message: 'Unable update password.' };
        return dispatch(updatePasswordFailure(err));
      }

      toast.success('Password changed successfully.', {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(updatePasswordSuccess(response.data));
    })
    .catch((err) => {
      toast.error(err.message, {
        position: toast.POSITION.BOTTOM_RIGHT,
      });
      return dispatch(updatePasswordFailure(err));
    });
};

/**
 * ===========================================================================
 * CHANGe USER ROLE
 * ===========================================================================
 */

export const changeRoleReq = () => ({
  type: t.CHANGE_ROLE_REQUEST,
});

export function changeRoleSuccess(response) {
  return {
    type: t.CHANGE_ROLE_SUCCESS,
    payload: response,
    meta: {
      schema: userSchema,
    },
  };
}

export function changeRoleFail(err) {
  return {
    type: t.CHANGE_ROLE_FAILURE,
    error: err.message,
  };
}

export const changeRole = (userId, currentRoleId, roleId) => (dispatch) => {
  dispatch(changeRoleReq());
  return (
    authApiService
      .put(`users/${userId}/role`, {
        currentRoleId,
        newRoleId: roleId.value,
      })
      // eslint-disable-next-line
      .then((response) => {
        if (response.data.message) {
          const err = response.data.message;
          toast.error(err, {
            position: toast.POSITION.BOTTOM_RIGHT,
          });
          return dispatch(changeRoleFail(err));
        }
        toast.success("The user's role was updated.", {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
        return dispatch(changeRoleSuccess(response.data));
      })
      .catch((err) => {
        toast.error(err.message, {
          position: toast.POSITION.BOTTOM_RIGHT,
        });
        return dispatch(changeRoleFail(err));
      })
  );
};
