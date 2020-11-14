import axios from "axios";

import { getToken } from "./auth";
import externalConfig from './external-config.json'

async function getApiClient() {
  const token = await getToken();

  const instance = axios.create({
    baseURL: externalConfig.ApiConfig.baseURL,
    timeout: externalConfig.ApiConfig.timeout,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return instance;
}

export function loadFromStorage(key) {
  console.log("Loading key from storage:", key);
  if (typeof Storage !== "undefined") {
    return JSON.parse(localStorage.getItem(key));
  } else {
    console.log("Storage not available");
    return null;
  }
}

export function saveInStorage(key, data) {
  console.log("Saving key in the storage:", key);
  if (typeof Storage !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  } else {
    console.log("Storage not available");
  }
}

export async function loadFromRestApi(resourcePath, queryParams) {
  const instance = await getApiClient();

  console.log("Loading data from API:", resourcePath, queryParams);
  const response = await instance.get(resourcePath, {
    params: queryParams,
    responseType: "json",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
  console.log("Data loaded from API", response.data);

  return response.data;
}

export async function postInRestApi(resourcePath, body) {
  const instance = await getApiClient();

  try {
    const data = JSON.stringify(body);
    console.log("Request post data to API:", resourcePath, data);
    const result = await instance.post(resourcePath, data);
    console.log("Post data result", result.data);
    return result.data;
  } catch (error) {
    console.log("Error posting data in API", error);
    throw error;
  }
}

export async function putInRestApi({resourcePath, data, queryParams}) {
  const instance = await getApiClient();

  const config = queryParams ? {params: queryParams} : undefined;

  try {
    console.log("Request PUT method to API", resourcePath, data, config);
    const result = await instance.put(resourcePath, data, config);
    console.log("PUT result", result.data);
    return result.data;
  } catch (error) {
    console.log("Error executing PUT method", error);
    throw error;
  }
}

export async function saveInRestApi(resourcePath, changeSet) {
  const data = JSON.stringify(changeSet.transform());
  return putInRestApi({resourcePath, data});
}

export async function deleteInRestApi(resourcePath) {
  const instance = await getApiClient();

  try {
    console.log("Request delete data to API:", resourcePath);
    const result = await instance.delete(resourcePath);
    console.log("Data deleted", result.data);
    return result.data;
  } catch (error) {
    console.log("Error deleting data in API", error);
    throw error;
  }
}

export async function load({ key, resourcePath, queryParams, transformer, callback }) {
  let data = loadFromStorage(key);
  console.log("Data from key", key, "in storage", data);

  if ((data === null || data === undefined) && resourcePath) {
    data = await loadFromRestApi(resourcePath, queryParams);

    if(transformer) {
      data = transformer(data, queryParams);
    }

    saveInStorage(key, data);
  }

  if (data !== null && callback) {
    callback(data);
  }

  return data;
}

export async function reload({ key, resourcePath, queryParams, transformer, callback }) {
  console.log("Reloading data from key", key, "in storage");

  let data = await loadFromRestApi(resourcePath, queryParams);

  if(transformer) {
    data = transformer(data, queryParams);
  }

  saveInStorage(key, data);

  if (data !== null && callback) {
    callback(data);
  }

  return data;
}

export async function create({ key, merger, resourcePath, body, callback }) {
  const createdObjResult = await postInRestApi(resourcePath, body);

  const currentData = loadFromStorage(key);
  const updated = merger(currentData, createdObjResult);

  saveInStorage(key, updated);

  if (callback) {
    console.log("Calling create callback function");
    callback();
  }
}

export async function update({
  key,
  changeSet,
  merger,
  resourcePath,
  callback,
}) {
  const updatedObjResult = await saveInRestApi(resourcePath, changeSet);

  console.log("Merging data");
  const currentData = loadFromStorage(key);
  const updated = merger(currentData, updatedObjResult);

  saveInStorage(key, updated);

  if (callback) {
    console.log("Calling update callback function");
    callback();
  }
}

export function diff(changeSet) {
  const originalState = changeSet.oldState;
  const newState = changeSet.newState;
  const oldAttributes = {};
  const updatedAttributes = {};

  for (let attr in originalState) {
    if (originalState[attr] !== newState[attr]) {
      oldAttributes[attr] = originalState[attr];
      updatedAttributes[attr] = newState[attr];
    }
  }

  return {
    old: oldAttributes,
    new: updatedAttributes,
  };
}

export async function remove({
  key,
  itemToDelete,
  merger,
  resourcePath,
  callback,
}) {

  const deleteResult = await deleteInRestApi(resourcePath);

  const currentData = loadFromStorage(key);

  console.log("Merging data");
  const updated = merger(currentData, deleteResult);
  saveInStorage(key, updated);

  if (callback) {
    console.log("Calling delete callback function");
    callback();
  }
}

export async function upload(accountId, walletId, parserId, file) {
  const url = `/account/${accountId}/wallet/${walletId}/upload/${parserId}`;
  const queryParams = {
    fileName: file.name
  }

  const s3Url = await loadFromRestApi(url, queryParams);
  console.log("S3 signed URL:", s3Url);

  try {
    const options = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': file.type
      }
    };
    console.log("Uploading file to S3", file.name);
    const result = await axios.put(s3Url, file, options);
    console.log("File uploaded", result.data);
    return result.data;
  } catch (error) {
    console.log("Error uploading file", error);
    throw error;
  }

}

export function cleanLocal(key) {
  console.log("Removing key from storage:", key);
  if (typeof Storage !== "undefined") {
    localStorage.removeItem(key);
  } else {
    console.log("Storage not available");
    return null;
  }
}

export class ChangeSet {
  constructor(oldState, newState, transform) {
    this.oldState = oldState;
    this.newState = newState;
    this.transform = transform ? () => transform(this) : this.diff;
  }

  diff() {
    const old = {};
    const updated = {};

    for (let attr in this.oldState) {
      if (this.oldState[attr] !== this.newState[attr]) {
        old[attr] = this.oldState[attr];
        updated[attr] = this.newState[attr];
      }
    }

    return {
      old: old,
      new: updated,
    };
  }
}
