import { Router } from 'express';
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

jest.mock("../controllers/playlist.controller.js", () => ({
    addVideoToPlaylist: jest.fn(),
    createPlaylist: jest.fn(),
    deletePlaylist: jest.fn(),
    getPlaylistById: jest.fn(),
    getUserPlaylists: jest.fn(),
    removeVideoFromPlaylist: jest.fn(),
    updatePlaylist: jest.fn(),
}));

jest.mock("../middlewares/auth.middleware.js", () => ({
    verifyJWT: jest.fn((req, res, next) => {
        if (req.headers.authorization === 'Bearer valid_jwt_token') {
            next();
        } else {
            res.status(401).json({ message: 'Invalid JWT' });
        }
    }),
}));

const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist);

router
    .route("/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist);

router.route("/add/:videoId/:playlistId").patch(addVideoToPlaylist);
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist);

router.route("/user/:userId").get(getUserPlaylists);

export default router;

# happy_path - verifyJWT - Test that JWT is verified for all routes
test('test_jwt_verification', async () => {
    const req = { headers: { authorization: 'Bearer valid_jwt_token' } };
    const res = {};
    const next = jest.fn();

    verifyJWT(req, res, next);

    expect(next).toHaveBeenCalled();
});

# happy_path - createPlaylist - Test that a new playlist is created successfully
test('test_create_playlist', async () => {
    const req = { body: { name: 'My Playlist', userId: 'user123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ playlistId: 'new_playlist_id' });
});

# happy_path - getPlaylistById - Test that playlist is retrieved by ID
test('test_get_playlist_by_id', async () => {
    const req = { params: { playlistId: 'playlist123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getPlaylistById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ playlist: { id: 'playlist123', name: 'My Playlist' } });
});

# happy_path - updatePlaylist - Test that playlist is updated successfully
test('test_update_playlist', async () => {
    const req = { params: { playlistId: 'playlist123' }, body: { name: 'Updated Playlist' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updatePlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Playlist updated' });
});

# happy_path - deletePlaylist - Test that playlist is deleted successfully
test('test_delete_playlist', async () => {
    const req = { params: { playlistId: 'playlist123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await deletePlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Playlist deleted' });
});

# happy_path - addVideoToPlaylist - Test that a video is added to a playlist
test('test_add_video_to_playlist', async () => {
    const req = { params: { videoId: 'video123', playlistId: 'playlist123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addVideoToPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Video added' });
});

# happy_path - removeVideoFromPlaylist - Test that a video is removed from a playlist
test('test_remove_video_from_playlist', async () => {
    const req = { params: { videoId: 'video123', playlistId: 'playlist123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await removeVideoFromPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Video removed' });
});

# happy_path - getUserPlaylists - Test that user playlists are retrieved
test('test_get_user_playlists', async () => {
    const req = { params: { userId: 'user123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUserPlaylists(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ playlists: [{ id: 'playlist123', name: 'My Playlist' }] });
});

# edge_case - verifyJWT - Test that JWT verification fails with invalid token
test('test_jwt_verification_invalid_token', async () => {
    const req = { headers: { authorization: 'Bearer invalid_jwt_token' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    verifyJWT(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid JWT' });
});

# edge_case - createPlaylist - Test that creating a playlist fails with missing name
test('test_create_playlist_missing_name', async () => {
    const req = { body: { userId: 'user123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await createPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Name is required' });
});

# edge_case - getPlaylistById - Test that getting a playlist fails with non-existent ID
test('test_get_playlist_non_existent_id', async () => {
    const req = { params: { playlistId: 'non_existent_id' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getPlaylistById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Playlist not found' });
});

# edge_case - updatePlaylist - Test that updating a playlist fails with invalid ID
test('test_update_playlist_invalid_id', async () => {
    const req = { params: { playlistId: 'invalid_id' }, body: { name: 'Updated Playlist' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await updatePlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Playlist not found' });
});

# edge_case - deletePlaylist - Test that deleting a playlist fails with non-existent ID
test('test_delete_playlist_non_existent_id', async () => {
    const req = { params: { playlistId: 'non_existent_id' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await deletePlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Playlist not found' });
});

# edge_case - addVideoToPlaylist - Test that adding a video fails with non-existent video ID
test('test_add_video_non_existent_id', async () => {
    const req = { params: { videoId: 'non_existent_id', playlistId: 'playlist123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await addVideoToPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Video not found' });
});

# edge_case - removeVideoFromPlaylist - Test that removing a video fails with non-existent video ID
test('test_remove_video_non_existent_id', async () => {
    const req = { params: { videoId: 'non_existent_id', playlistId: 'playlist123' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await removeVideoFromPlaylist(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Video not found' });
});

# edge_case - getUserPlaylists - Test that retrieving playlists fails with non-existent user ID
test('test_get_user_playlists_non_existent_user', async () => {
    const req = { params: { userId: 'non_existent_user' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await getUserPlaylists(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
});

