import { Client, Account, Databases, Functions } from "appwrite";

const client = new Client();
client.setEndpoint("https://cloud.appwrite.io/v1").setProject("PRoject  ID");

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);
