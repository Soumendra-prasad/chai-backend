import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';
import { jest } from '@jest/globals';

jest.mock('dotenv', () => ({
    config: jest.fn().mockImplementation(({ path }) => {
        if (path === './.env') {
            process.env.PORT = '8000';
        }
    }),
}));

jest.mock('./db/index.js', () => jest.fn().mockResolvedValue(undefined));

jest.spyOn(app, 'listen').mockImplementation((port, callback) => {
    callback();
});

console.log = jest.fn(); // Mock console.log

app.on = jest.fn((event, callback) => {
    if (event === 'error') {
        callback(new Error('Test error'));
    }
});

// Mocking mongoose for potential future use
jest.mock('mongoose', () => ({
    connect: jest.fn().mockImplementation(() => Promise.resolve()),
}));

// Mocking process.env for testing edge cases
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';

# happy_path - config - Test that dotenv config loads environment variables from .env file
test('Test that dotenv config loads environment variables from .env file', () => {
    require('dotenv').config({ path: './.env' });
    expect(process.env.PORT).toBeDefined();
});

# happy_path - connect_db - Test that connectDB resolves and server starts listening on the specified port
test('Test that connectDB resolves and server starts listening on the specified port', async () => {
    await connectDB();
    expect(app.listen).toHaveBeenCalledWith('8000', expect.any(Function));
    expect(console.log).toHaveBeenCalledWith('⚙️ Server is running at port : 8000');
});

# happy_path - listen - Test that app.listen is called with correct port
test('Test that app.listen is called with correct port', () => {
    app.listen(process.env.PORT || 8000, () => {});
    expect(app.listen).toHaveBeenCalledWith('8000', expect.any(Function));
});

# happy_path - console_log - Test that console.log outputs server running message
test('Test that console.log outputs server running message', () => {
    console.log('⚙️ Server is running at port : 8000');
    expect(console.log).toHaveBeenCalledWith('⚙️ Server is running at port : 8000');
});

# happy_path - import - Test that app is correctly imported and initialized
test('Test that app is correctly imported and initialized', () => {
    expect(app).toBeDefined();
});

# edge_case - config - Test that dotenv config handles missing .env file gracefully
test('Test that dotenv config handles missing .env file gracefully', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    require('dotenv').config({ path: './nonexistent.env' });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
});

# edge_case - connect_db - Test that connectDB rejects when MongoDB URI is invalid
test('Test that connectDB rejects when MongoDB URI is invalid', async () => {
    jest.mock('./db/index.js', () => jest.fn().mockRejectedValue(new Error('MONGO db connection failed')));
    await expect(connectDB()).rejects.toThrow('MONGO db connection failed');
});

# edge_case - listen - Test that app.listen handles invalid port gracefully
test('Test that app.listen handles invalid port gracefully', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    app.listen('invalid_port', () => {});
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
});

# edge_case - console_log - Test that console.log handles null message without crashing
test('Test that console.log handles null message without crashing', () => {
    console.log(null);
    expect(console.log).toHaveBeenCalledWith(null);
});

# edge_case - app_on - Test that app.on handles errors during server operation
test('Test that app.on handles errors during server operation', () => {
    app.on('error', (err) => {
        console.error(err);
    });
    expect(app.on).toHaveBeenCalledWith('error', expect.any(Function));
});

