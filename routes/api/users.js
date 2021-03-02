const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator/check');
//random avatars
const avatars = [
	'https://i.imgur.com/GxDX8cV.png',
	'https://i.imgur.com/KaEqmbr.png',
	'https://i.imgur.com/CUw0mtw.png',
	'https://i.imgur.com/CDxtHiC.png',
	'https://i.imgur.com/JbPoJsN.png',
	'https://i.imgur.com/zRz7MZl.png',
	'https://i.imgur.com/XEiyLVL.png',
	'https://i.imgur.com/8zCGikH.png',
	'https://i.imgur.com/QWe4qbG.png',
	'https://i.imgur.com/XmKkUxR.png',
];

const User = require('../../models/User');

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post(
	'/',
	[
		check('name', 'Name is required').not().isEmpty(),
		check('email', 'Please include a valid email').isEmail(),
		check(
			'password',
			'Please enter a password with 6 or more characters'
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			let user = await User.findOne({ email: email });

			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] });
			}

			const avatar = avatars[Math.floor(Math.random() * avatars.length)];

			user = new User({
				name,
				email,
				avatar,
				password,
			});

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save();

			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send('Server error');
		}
	}
);

module.exports = router;
