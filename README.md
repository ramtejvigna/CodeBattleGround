# 🏆 CodeBattleGround

**CodeBattleGround** is a modern, full-stack coding challenge platform built with Next.js that allows developers to compete in real-time coding battles, solve algorithmic problems, and climb the leaderboard. Think of it as a combination of LeetCode, HackerRank, and competitive programming platforms with a focus on community and real-time competition.

## 🚀 Features

### Core Functionality
- **🎯 Coding Challenges**: Solve problems across multiple difficulty levels (Easy, Medium, Hard)
- **💻 Multi-Language Support**: Code in JavaScript, Python, Java, C++, C, Ruby, and more
- **🔒 Secure Code Execution**: Docker-based sandboxed environment for safe code execution
- **⚡ Real-time Results**: Instant feedback on code submissions with detailed test case results
- **🏅 Comprehensive Ranking System**: Points, badges, streaks, and leaderboard rankings

### User Experience
- **👤 User Profiles**: Customizable profiles with GitHub integration
- **📊 Progress Tracking**: Detailed statistics, solved problems, and performance metrics
- **🎨 Modern UI**: Beautiful, responsive design with dark/light theme support
- **📱 Mobile Responsive**: Full functionality across all devices

### Community & Competition
- **🏆 Leaderboards**: Global and category-specific rankings
- **🎮 Tournaments**: Regular coding competitions and battles
- **💬 Community Forums**: Discussion boards for problem-solving and networking
- **🔗 GitHub Integration**: Connect your GitHub profile and showcase your work

### Admin Features
- **📈 Analytics Dashboard**: User activity, challenge statistics, and platform metrics
- **👥 User Management**: Admin panel for managing users and permissions
- **📝 Challenge Management**: Create, edit, and manage coding challenges
- **🔧 System Monitoring**: Real-time monitoring of code execution and system health

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI components
- **State Management**: Zustand
- **Code Editor**: Monaco Editor (VS Code editor)
- **Animations**: Framer Motion
- **Charts**: Recharts

### Backend & Database
- **API**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js (GitHub, Google OAuth)
- **File Storage**: Local/Cloud storage for assets

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Code Execution**: Docker containers for secure sandboxing
- **Environment**: Development and production configurations
- **CI/CD**: Ready for GitHub Actions integration

## 🏗️ Project Structure

```
client/
├── prisma/                 # Database schema and migrations
│   ├── schema.prisma      # Prisma database schema
│   └── migrations/        # Database migrations
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── challenge/     # Challenge pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── profile/       # User profiles
│   │   └── community/     # Community features
│   ├── components/        # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── admin/         # Admin-specific components
│   │   └── Challenge-Page/ # Challenge-related components
│   ├── context/           # React context providers
│   ├── lib/               # Utilities and configurations
│   │   ├── store/         # Zustand stores
│   │   └── services/      # Business logic services
│   └── middleware.ts      # Next.js middleware
├── public/                # Static assets
├── compose.yaml           # Docker Compose configuration
├── Dockerfile            # Docker configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for code execution)
- **PostgreSQL** (can be run via Docker)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/CodeBattleGround.git
cd CodeBattleGround/client
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in the required environment variables:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/codebattleground"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# OAuth Providers
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database credentials for Docker
POSTGRES_USER="your-db-user"
POSTGRES_PASSWORD="your-db-password"
POSTGRES_DATABASE="codebattleground"
```

4. **Start the development environment**

**Option A: Using Docker Compose (Recommended)**
```bash
# Start all services (app, database, code execution containers)
docker-compose up -d

# Run database migrations
docker-compose exec app npx prisma migrate dev

# Seed the database (optional)
docker-compose exec app npx prisma db seed
```

**Option B: Manual Setup**
```bash
# Start PostgreSQL (if not using Docker)
# Make sure PostgreSQL is running and accessible

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed the database (optional)
npx prisma db seed

# Start the development server
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### 🔧 Development Setup

**Database Management**
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma client after schema changes
npx prisma generate
```

**Docker Commands**
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build
```

## 🎯 Usage

### For Users
1. **Sign up** using GitHub or Google OAuth
2. **Complete your profile** with preferred programming languages
3. **Browse challenges** by difficulty or category
4. **Solve problems** using the built-in code editor
5. **Submit solutions** and get instant feedback
6. **Track your progress** and climb the leaderboard
7. **Join competitions** and coding battles

### For Admins
1. **Access admin dashboard** at `/admin`
2. **Monitor user activity** and system metrics
3. **Create and manage challenges**
4. **Moderate community content**
5. **Analyze platform statistics**

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute
- 🐛 **Bug Reports**: Report issues and bugs
- 💡 **Feature Requests**: Suggest new features
- 🔧 **Code Contributions**: Submit pull requests
- 📚 **Documentation**: Improve documentation
- 🎨 **Design**: UI/UX improvements
- 🧪 **Testing**: Add tests and improve coverage

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

4. **Test your changes**
```bash
npm run build
npm run test  # if tests are available
```

5. **Commit and push**
```bash
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

6. **Open a Pull Request**
   - Provide a clear description of your changes
   - Reference any related issues
   - Include screenshots for UI changes

### Code Style Guidelines
- Use **TypeScript** for type safety
- Follow **ESLint** and **Prettier** configurations
- Write **descriptive commit messages**
- Add **JSDoc comments** for complex functions
- Use **meaningful variable names**

### Adding New Features
- **Challenges**: Add new problem categories or difficulty levels
- **Languages**: Support for additional programming languages
- **Themes**: New UI themes and customization options
- **Integrations**: Third-party service integrations
- **Analytics**: Enhanced tracking and reporting

## 📊 API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/session` - Get current session

### Challenges
- `GET /api/challenges` - List all challenges
- `GET /api/challenges/[id]` - Get challenge details
- `POST /api/challenges` - Create new challenge (admin)

### Submissions
- `POST /api/execute` - Execute code
- `GET /api/submissions` - Get user submissions
- `POST /api/challenges/[id]/submissions` - Submit solution

### User Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile/update` - Update profile
- `GET /api/rankings` - Get leaderboard

## 🚀 Deployment

### Production Deployment
1. **Build the application**
```bash
npm run build
```

2. **Deploy using Docker**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Set up environment variables** for production
4. **Configure database** with production credentials
5. **Set up reverse proxy** (nginx/Apache)
6. **Configure SSL certificates**

### Environment Configuration
- **Development**: `http://localhost:3000`
- **Staging**: Configure staging environment
- **Production**: Set up production domain and SSL

## 🛡️ Security

- **Code Execution**: Docker sandboxing prevents malicious code
- **Authentication**: Secure OAuth implementation
- **Data Validation**: Input sanitization and validation
- **Rate Limiting**: API rate limiting to prevent abuse
- **Database Security**: Parameterized queries prevent SQL injection

## 🔍 Troubleshooting

### Common Issues
1. **Database Connection**: Check PostgreSQL is running
2. **Docker Issues**: Ensure Docker daemon is running
3. **Port Conflicts**: Check if port 3000 is available
4. **Environment Variables**: Verify all required vars are set

### Getting Help
- **GitHub Issues**: Report bugs and ask questions
- **Discussions**: Community discussions and support
- **Documentation**: Check the docs for detailed guides

## 📈 Roadmap

- [ ] **Live Competitions**: Real-time multiplayer coding battles
- [ ] **AI Code Review**: Automated code quality feedback
- [ ] **Video Tutorials**: Integrated learning resources
- [ ] **Team Challenges**: Collaborative problem-solving
- [ ] **Advanced Analytics**: Machine learning insights

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the amazing framework
- **Prisma Team** for the excellent ORM
- **Vercel** for hosting and deployment tools
- **Open Source Community** for the incredible libraries

---

<div align="center">
  <p>Built with ❤️ by the CodeBattleGround team</p>
  <p>
    <a href="https://github.com/yourusername/CodeBattleGround">GitHub</a> •
    <a href="https://codebattleground.com">Website</a>
  </p>
</div>
