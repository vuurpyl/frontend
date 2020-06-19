import API from '@misakey/api';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

export const getBoxBuilder = (id, body, queryParams = {}) => API
  .use(API.endpoints.boxes.read)
  .build({ id }, body, objectToSnakeCase(queryParams))
  .send()
  .then(objectToCamelCaseDeep);

export const getBoxEventsBuilder = (id) => API
  .use(API.endpoints.boxes.events.find)
  .build({ id })
  .send()
  .then((events) => events.map(objectToCamelCaseDeep));

export const getBoxWithEventsBuilder = (id) => Promise.all([
  getBoxBuilder(id),
  getBoxEventsBuilder(id),
])
  .then(([box, events]) => ({
    ...box,
    events,
  }));


export const getUserBoxesBuilder = (payload) => API
  .use(API.endpoints.boxes.find)
  .build(null, null, objectToSnakeCase({
    withBlobCount: true,
    orderBy: 'updated_at DESC',
    ...payload,
  }))
  .send()
  .then((response) => response.map(objectToCamelCaseDeep));

export const countUserBoxesBuilder = (payload) => {
  const query = isNil(payload) ? {} : objectToSnakeCase(payload);
  return API
    .use(API.endpoints.boxes.count)
    .build(null, null, query)
    .send()
    .then((response) => parseInt(response.headers.get('X-Total-Count'), 10));
};

export const createBoxBuilder = (payload) => API
  .use(API.endpoints.boxes.create)
  .build(null, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCaseDeep);

export const createBoxEventBuilder = (id, payload) => API
  .use(API.endpoints.boxes.events.create)
  .build({ id }, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCaseDeep);