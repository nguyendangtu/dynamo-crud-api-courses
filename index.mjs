import { send } from "./db.mjs";
import { GetItemCommand, PutItemCommand, DeleteItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const getCourse = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ courseCode: event.pathParameters.courseCode }),
        };
        const { Item } = await send(new GetItemCommand(params));

        console.log({ Item });
        response.body = JSON.stringify({
            message: "Successfully retrieved course.",
            data: (Item) ? unmarshall(Item) : {},
            rawData: Item,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get course.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const createCourse = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(body || {}),
        };
        const createResult = await send(new PutItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully created course.",
            createResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create course.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const updateCourse = async (event) => {
    const response = { statusCode: 200 };

    try {
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ courseCode: event.pathParameters.courseCode }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };
        const updateResult = await send(new UpdateItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully updated course.",
            updateResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to update course.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const deleteCourse = async (event) => {
    const response = { statusCode: 200 };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ courseCode: event.pathParameters.courseCode }),
        };
        const deleteResult = await send(new DeleteItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully deleted course.",
            deleteResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete course.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

const getAllCourses = async () => {
    const response = { statusCode: 200 };

    try {
        const { Items } = await send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));

        response.body = JSON.stringify({
            message: "Successfully retrieved all courses.",
            data: Items.map((item) => unmarshall(item)),
            Items,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve courses.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }

    return response;
};

export default {
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    getAllCourses,
};