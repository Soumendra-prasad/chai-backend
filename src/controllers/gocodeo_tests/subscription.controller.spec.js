import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

jest.mock("mongoose");
jest.mock("../models/user.model.js");
jest.mock("../models/subscription.model.js");
jest.mock("../utils/ApiError.js");
jest.mock("../utils/ApiResponse.js");
jest.mock("../utils/asyncHandler.js");

beforeEach(() => {
    jest.clearAllMocks();

    // Mocking mongoose methods
    mongoose.isValidObjectId.mockImplementation((id) => id === 'validChannelId' || id === 'validSubscriberId');

    // Mocking User model methods
    User.find.mockResolvedValue([{ id: 'user1' }, { id: 'user2' }, { id: 'user3' }]);
    User.findById.mockResolvedValue({ id: 'validSubscriberId' });

    // Mocking Subscription model methods
    Subscription.find.mockResolvedValue([{ channelId: 'validChannelId', subscriberId: 'validSubscriberId' }]);
    Subscription.create.mockResolvedValue({ channelId: 'validChannelId', subscriberId: 'validSubscriberId' });
    Subscription.deleteOne.mockResolvedValue({ deletedCount: 1 });

    // Mocking ApiError
    ApiError.mockImplementation((status, message) => {
        this.status = status;
        this.message = message;
    });

    // Mocking ApiResponse
    ApiResponse.mockImplementation((status, data) => {
        this.status = status;
        this.data = data;
    });

    // Mocking asyncHandler
    asyncHandler.mockImplementation((fn) => (req, res, next) => {
        return Promise.resolve(fn(req, res, next)).catch(next);
    });
});

# happy_path - toggle_subscription - Test that toggleSubscription successfully toggles a subscription when given a valid channelId
test('test_toggle_subscription_valid_channel', async () => {
    const req = { params: { channelId: 'validChannelId' } };
    const res = { json: jest.fn() };
    await toggleSubscription(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', message: 'Subscription toggled successfully' });
});

# happy_path - get_user_channel_subscribers - Test that getUserChannelSubscribers returns a list of subscribers for a valid channelId
test('test_get_user_channel_subscribers_valid_channel', async () => {
    const req = { params: { channelId: 'validChannelId' } };
    const res = { json: jest.fn() };
    await getUserChannelSubscribers(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', subscribers: ['user1', 'user2', 'user3'] });
});

# happy_path - get_subscribed_channels - Test that getSubscribedChannels returns a list of channels for a valid subscriberId
test('test_get_subscribed_channels_valid_subscriber', async () => {
    const req = { params: { subscriberId: 'validSubscriberId' } };
    const res = { json: jest.fn() };
    await getSubscribedChannels(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', channels: ['channel1', 'channel2'] });
});

# happy_path - toggle_subscription - Test that toggleSubscription does not create a duplicate subscription when toggled twice
test('test_toggle_subscription_twice', async () => {
    const req = { params: { channelId: 'validChannelId' } };
    const res = { json: jest.fn() };
    await toggleSubscription(req, res);
    await toggleSubscription(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', message: 'Subscription toggled successfully' });
});

# happy_path - get_user_channel_subscribers - Test that getUserChannelSubscribers returns an empty list for a channelId with no subscribers
test('test_get_user_channel_subscribers_no_subscribers', async () => {
    const req = { params: { channelId: 'channelWithNoSubscribers' } };
    const res = { json: jest.fn() };
    User.find.mockResolvedValue([]);
    await getUserChannelSubscribers(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', subscribers: [] });
});

# edge_case - toggle_subscription - Test that toggleSubscription handles invalid channelId gracefully
test('test_toggle_subscription_invalid_channel', async () => {
    const req = { params: { channelId: 'invalidChannelId' } };
    const res = { json: jest.fn() };
    await toggleSubscription(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Invalid channelId' });
});

# edge_case - get_user_channel_subscribers - Test that getUserChannelSubscribers handles invalid channelId gracefully
test('test_get_user_channel_subscribers_invalid_channel', async () => {
    const req = { params: { channelId: 'invalidChannelId' } };
    const res = { json: jest.fn() };
    await getUserChannelSubscribers(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Invalid channelId' });
});

# edge_case - get_subscribed_channels - Test that getSubscribedChannels handles invalid subscriberId gracefully
test('test_get_subscribed_channels_invalid_subscriber', async () => {
    const req = { params: { subscriberId: 'invalidSubscriberId' } };
    const res = { json: jest.fn() };
    await getSubscribedChannels(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Invalid subscriberId' });
});

# edge_case - toggle_subscription - Test that toggleSubscription handles missing channelId parameter
test('test_toggle_subscription_missing_channel', async () => {
    const req = { params: {} };
    const res = { json: jest.fn() };
    await toggleSubscription(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: 'Missing channelId parameter' });
});

# edge_case - get_subscribed_channels - Test that getSubscribedChannels returns an empty list for a subscriberId with no subscriptions
test('test_get_subscribed_channels_no_subscriptions', async () => {
    const req = { params: { subscriberId: 'subscriberWithNoSubscriptions' } };
    const res = { json: jest.fn() };
    Subscription.find.mockResolvedValue([]);
    await getSubscribedChannels(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: 'success', channels: [] });
});

