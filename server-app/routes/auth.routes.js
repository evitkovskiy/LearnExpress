const {Router} = require(`express`);
const bcrypt = require(`bcryptjs`);
const {check, validatorResult} = require(`express-validator`)
const User = require(`../models/User`);
const router = Router();
const jwt = require(`jsonwebtoken`);
const config = require(`config`)


// /api/auth/register
router.post(`/register`,
 [
     check(`email`, `Некорректный email`).isEmail(),
     check(`password`, `Min length 6 symbols`).isLength({min: 6})
 ],
 async (req, res) => {
    try {
        const errors = validatorResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array(),
            message: `Incor data register`})
        }
        const {email, password} = req.body;

        const candidate = await User.findOne({email});
        if(candidate) {
            return res.status(400).json({message: `Такой пользователь существует`})
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({email, password: hashedPassword})

        await user.save();

        res.status(201).json({message: `Пользователь создан`})
    } catch(e) {
        res.status(500).json({message: "Что-то пошло не так"})
    }
})

// /api/auth/register
router.post(`/login`, 
    [
        check(`email`, `Input correct email`).normalizeEmail().isEmail(),
        check(`password`, `Input password`).exists()
    ],
    async (req, res) => {

    try {
        const errors = validatorResult(req);

        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array(),
            message: `Incor data login`})
        }

        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(!user) {
            return res.status(400).json({message: `User not find`})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        
        if(!isMatch) {
            return res.status(400).json({message: `Incorrect password`})
        }

        const token = jwt.sign(
            {userId: user.id},
            config.get(`jwtSecret`),
            {expiresIn: `1h`}

        )

        res.json({token, userId: user.id})

        res.status(201).json({message: `Пользователь создан`})
    } catch(e) {
        res.status(500).json({message: "Что-то пошло не так"})
    }
})


module.exports = router;
