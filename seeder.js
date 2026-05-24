require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    fullname: { type: String, required: true, trim: true, maxlength: 25 },
    username: { type: String, required: true, trim: true, maxlength: 25, unique: true },
    email:    { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    avatar:   { type: String, default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png' },
    role:     { type: String, default: 'user' },
    gender:   { type: String, default: 'male' },
    mobile:   { type: String, default: '' },
    address:  { type: String, default: '' },
    story:    { type: String, default: '', maxlength: 200 },
    website:  { type: String, default: '' },
    followers:  [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    following:  [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    saved:      [{ type: mongoose.Types.ObjectId, ref: 'user' }]
}, { timestamps: true })

const postSchema = new mongoose.Schema({
    content:  String,
    images:   { type: Array, required: true },
    likes:    [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    comments: [{ type: mongoose.Types.ObjectId, ref: 'comment' }],
    user:     { type: mongoose.Types.ObjectId, ref: 'user' }
}, { timestamps: true })

const User = mongoose.models.user || mongoose.model('user', userSchema)
const Post = mongoose.models.post || mongoose.model('post', postSchema)

// ============================================================
// FAKE DATA — All English
// ============================================================
const fakeUsers = [
    {
        fullname: 'Alex Johnson',
        username: 'alex_johnson',
        email:    'alex@example.com',
        gender:   'male',
        story:    'Photography lover 📸 | World traveler ✈️ | New York',
        website:  'https://alexjohnson.com',
        avatar:   'https://i.pravatar.cc/150?img=3'
    },
    {
        fullname: 'Emily Davis',
        username: 'emily_davis',
        email:    'emily@example.com',
        gender:   'female',
        story:    'Music & Art enthusiast 🎨 | Based in London',
        website:  'https://emilydavis.art',
        avatar:   'https://i.pravatar.cc/150?img=5'
    },
    {
        fullname: 'James Wilson',
        username: 'james_wilson',
        email:    'james@example.com',
        gender:   'male',
        story:    'Full-stack developer 💻 | Gamer by night 🎮',
        website:  'https://jameswilson.dev',
        avatar:   'https://i.pravatar.cc/150?img=7'
    },
    {
        fullname: 'Sophia Brown',
        username: 'sophia_brown',
        email:    'sophia@example.com',
        gender:   'female',
        story:    'Foodie 🍕 | Yoga lover 🧘 | California girl',
        avatar:   'https://i.pravatar.cc/150?img=9'
    },
    {
        fullname: 'Ryan Martinez',
        username: 'ryan_martinez',
        email:    'ryan@example.com',
        gender:   'male',
        story:    'Fitness enthusiast 💪 | Outdoor adventures 🏕️',
        avatar:   'https://i.pravatar.cc/150?img=11'
    }
]

const fakePosts = [
    {
        content: 'What an amazing day! Went hiking with friends and the views were absolutely breathtaking. 🌄 Nature never fails to amaze me.',
        images: ['https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=600']
    },
    {
        content: 'Just launched my new project built with React and Node.js! 🚀 Months of hard work finally paid off. Check it out and let me know what you think!',
        images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600']
    },
    {
        content: 'Golden hour at the beach 🌅 Some moments are simply too beautiful for words. Just grateful to be here.',
        images: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600']
    },
    {
        content: 'Cooked homemade pasta from scratch tonight! 🍝 First time trying this recipe and honestly it turned out better than expected.',
        images: ['https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600']
    },
    {
        content: 'Morning coffee and a good book — the perfect start to any day ☕📖 Currently reading "Atomic Habits" and it is genuinely changing my mindset.',
        images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600']
    },
    {
        content: 'Weekend road trip to the mountains ⛰️ So refreshing to unplug and just enjoy the scenery. Highly recommend everyone take a break like this.',
        images: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600']
    },
    {
        content: 'Attended an incredible tech conference today! 🎤 So many brilliant minds in one room. The future of AI and web development is looking very exciting.',
        images: ['https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600']
    }
]

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
async function seed() {
    try {
        const URI = process.env.MONGODB_URL
        if (!URI || URI === 'YOUR_MONGO_DB') {
            console.log('\n❌ ERROR: MONGODB_URL is not set in your .env file!')
            console.log('   Please add your MongoDB connection string first.\n')
            process.exit(1)
        }

        console.log('\n⏳ Connecting to MongoDB...')
        await mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
        console.log('✅ MongoDB connected!\n')

        const hashedPassword = await bcrypt.hash('password123', 12)

        // Clean up old seed data
        const existingEmails = fakeUsers.map(u => u.email)
        await User.deleteMany({ email: { $in: existingEmails } })
        console.log('🗑️  Removed existing seed users (if any)')

        // Create users
        const createdUsers = []
        for (const u of fakeUsers) {
            const user = await User.create({ ...u, password: hashedPassword })
            createdUsers.push(user)
            console.log(`👤 Created user: ${u.fullname} (@${u.username})`)
        }

        // Set up followers / following relationships
        const mainUser = createdUsers[0]

        // All other users follow mainUser
        for (let i = 1; i < createdUsers.length; i++) {
            await User.findByIdAndUpdate(createdUsers[i]._id, {
                $addToSet: { following: mainUser._id }
            })
            await User.findByIdAndUpdate(mainUser._id, {
                $addToSet: { followers: createdUsers[i]._id }
            })
        }

        // mainUser also follows first 3 users
        for (let i = 1; i <= 3; i++) {
            await User.findByIdAndUpdate(mainUser._id, {
                $addToSet: { following: createdUsers[i]._id }
            })
            await User.findByIdAndUpdate(createdUsers[i]._id, {
                $addToSet: { followers: mainUser._id }
            })
        }

        // Also set up some cross-follow relationships between other users
        await User.findByIdAndUpdate(createdUsers[1]._id, { $addToSet: { following: createdUsers[2]._id } })
        await User.findByIdAndUpdate(createdUsers[2]._id, { $addToSet: { followers: createdUsers[1]._id } })
        await User.findByIdAndUpdate(createdUsers[3]._id, { $addToSet: { following: createdUsers[4]._id } })
        await User.findByIdAndUpdate(createdUsers[4]._id, { $addToSet: { followers: createdUsers[3]._id } })

        console.log('\n👥 Followers/Following relationships set up!')

        // Delete old seed posts
        const userIds = createdUsers.map(u => u._id)
        await Post.deleteMany({ user: { $in: userIds } })

        // Create posts across different users with likes
        for (let i = 0; i < fakePosts.length; i++) {
            const postUser = createdUsers[i % createdUsers.length]
            const likedBy = createdUsers
                .filter((_, idx) => idx !== i % createdUsers.length)
                .slice(0, 3)
                .map(u => u._id)
            await Post.create({
                ...fakePosts[i],
                user: postUser._id,
                likes: likedBy
            })
            console.log(`📝 Created post: "${fakePosts[i].content.substring(0, 45)}..."`)
        }

        console.log('\n✅ =========================================')
        console.log('   SEED COMPLETE! All data has been added.')
        console.log('=========================================')
        console.log('\n📋 Login credentials (same password for all users):')
        console.log('   Password: password123')
        fakeUsers.forEach(u => console.log(`   📧 ${u.email}  |  @${u.username}`))
        console.log('\n🚀 Now run "node server.js" and enjoy the app!\n')

        process.exit(0)
    } catch (err) {
        console.error('\n❌ Error occurred:', err.message)
        process.exit(1)
    }
}

seed()
