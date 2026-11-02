const templates = (() => {
  const node = typeof require !== 'undefined'
  const LANGS = node ? require('./langs') : langs
  const CAMO = node ? require('./camo') : camo

  const LIST = [
    {
      id: 'python-backend',
      label: 'Python Backend (FastAPI)',
      root: 'backend-service',
      chat: 'py',
      style: 'snake',
      inbox: 'src/handlers',
      names: ['router', 'cache', 'session', 'models', 'schemas', 'serializers', 'tasks', 'worker', 'client', 'auth', 'middleware', 'views', 'utils', 'helpers', 'db', 'events', 'queue', 'scheduler', 'metrics', 'logger', 'validators', 'parser', 'storage', 'api', 'service', 'pipeline', 'notifier', 'retry', 'sync', 'exporter', 'importer', 'cli', 'settings', 'types', 'constants', 'exceptions', 'fixtures', 'permissions', 'signals', 'webhooks'],
      deps: ['fastapi', 'uvicorn', 'pydantic', 'sqlalchemy', 'httpx', 'python-dotenv', 'pytest'],
      files: ['.gitignore', '.env.example', '.editorconfig', 'requirements.txt', 'requirements-dev.txt', 'pyproject.toml', 'Dockerfile', 'docker-compose.yml', 'Makefile', 'LICENSE', '.github/workflows/ci.yml', 'alembic.ini', 'alembic/env.py', 'alembic/versions/0001_initial.py', 'src/__init__.py', 'src/main.py', 'src/api/__init__.py', 'src/api/deps.py', 'src/api/routes/__init__.py', 'src/api/routes/users.py', 'src/api/routes/auth.py', 'src/api/routes/health.py', 'src/core/__init__.py', 'src/core/config.py', 'src/core/database.py', 'src/core/security.py', 'src/core/logging.py', 'src/models/__init__.py', 'src/models/user.py', 'src/models/order.py', 'src/schemas/__init__.py', 'src/schemas/user.py', 'src/services/__init__.py', 'src/services/email.py', 'src/handlers/__init__.py', 'src/utils/__init__.py', 'src/utils/time.py', 'scripts/seed.py', 'tests/__init__.py', 'tests/conftest.py', 'tests/test_handlers.py', 'tests/test_users.py', 'docs/architecture.md'],
    },
    {
      id: 'django',
      label: 'Python Web (Django)',
      root: 'webapp',
      chat: 'py',
      style: 'snake',
      inbox: 'apps/core',
      names: ['views', 'forms', 'admin', 'signals', 'tasks', 'serializers', 'permissions', 'managers', 'mixins', 'filters', 'pagination', 'throttling', 'emails', 'utils', 'validators', 'context_processors'],
      deps: ['django', 'djangorestframework', 'celery', 'psycopg2-binary', 'gunicorn', 'pytest-django'],
      files: ['.gitignore', '.env.example', 'manage.py', 'requirements.txt', 'Dockerfile', 'docker-compose.yml', 'pytest.ini', 'config/__init__.py', 'config/settings/__init__.py', 'config/settings/base.py', 'config/settings/local.py', 'config/settings/production.py', 'config/urls.py', 'config/wsgi.py', 'config/asgi.py', 'apps/__init__.py', 'apps/core/__init__.py', 'apps/core/apps.py', 'apps/core/admin.py', 'apps/core/models.py', 'apps/core/urls.py', 'apps/core/migrations/__init__.py', 'apps/core/migrations/0001_initial.py', 'apps/accounts/__init__.py', 'apps/accounts/models.py', 'apps/accounts/views.py', 'apps/accounts/forms.py', 'apps/accounts/tests.py', 'templates/base.html', 'templates/accounts/login.html', 'static/css/main.css', 'static/js/app.js', 'locale/'],
    },
    {
      id: 'node-backend',
      label: 'Node.js Backend (Express, TypeScript)',
      root: 'api-server',
      chat: 'ts',
      style: 'camel',
      inbox: 'src/services',
      names: ['userService', 'authService', 'mailer', 'cacheClient', 'queueWorker', 'rateLimiter', 'sessionStore', 'paymentGateway', 'webhookHandler', 'metrics', 'scheduler', 'fileUploader', 'notification', 'searchIndex', 'auditLog', 'tokenService'],
      deps: ['express', 'zod', 'pino', 'prisma', 'jsonwebtoken', 'dotenv'],
      scripts: { dev: 'tsx watch src/index.ts', build: 'tsc -p .', start: 'node dist/index.js', test: 'vitest' },
      files: ['.gitignore', '.env.example', '.editorconfig', '.prettierrc', 'eslint.config.js', 'package.json', 'package-lock.json', 'tsconfig.json', 'Dockerfile', 'docker-compose.yml', '.github/workflows/ci.yml', 'src/index.ts', 'src/app.ts', 'src/config/env.ts', 'src/routes/index.ts', 'src/routes/users.ts', 'src/routes/auth.ts', 'src/controllers/userController.ts', 'src/controllers/authController.ts', 'src/middleware/auth.ts', 'src/middleware/errorHandler.ts', 'src/models/user.ts', 'src/services/', 'src/utils/logger.ts', 'src/types/express.d.ts', 'prisma/schema.prisma', 'prisma/migrations/', 'tests/app.test.ts', 'tests/users.test.ts'],
    },
    {
      id: 'spring',
      label: 'Java Backend (Spring Boot)',
      root: 'demo-service',
      chat: 'java',
      style: 'pascal',
      inbox: 'src/main/java/com/example/demo/service',
      names: ['UserService', 'OrderService', 'AuthService', 'PaymentService', 'MailService', 'CacheService', 'ReportService', 'InventoryService', 'NotificationService', 'SearchService', 'AuditService', 'TokenService', 'ScheduleService', 'FileService', 'BillingService', 'ShippingService'],
      deps: ['spring-boot-starter-web', 'spring-boot-starter-data-jpa', 'spring-boot-starter-validation', 'postgresql', 'lombok'],
      files: ['.gitignore', 'pom.xml', 'mvnw', 'mvnw.cmd', 'Dockerfile', 'HELP.md', '.mvn/wrapper/maven-wrapper.properties', 'src/main/java/com/example/demo/DemoApplication.java', 'src/main/java/com/example/demo/config/SecurityConfig.java', 'src/main/java/com/example/demo/config/WebConfig.java', 'src/main/java/com/example/demo/controller/UserController.java', 'src/main/java/com/example/demo/controller/AuthController.java', 'src/main/java/com/example/demo/domain/User.java', 'src/main/java/com/example/demo/domain/Order.java', 'src/main/java/com/example/demo/dto/UserResponse.java', 'src/main/java/com/example/demo/exception/GlobalExceptionHandler.java', 'src/main/java/com/example/demo/repository/UserRepository.java', 'src/main/java/com/example/demo/repository/OrderRepository.java', 'src/main/java/com/example/demo/service/', 'src/main/resources/application.yml', 'src/main/resources/application-dev.yml', 'src/main/resources/db/migration/V1__init.sql', 'src/main/resources/static/', 'src/main/resources/templates/', 'src/test/java/com/example/demo/DemoApplicationTests.java', 'src/test/java/com/example/demo/controller/UserControllerTest.java'],
    },
    {
      id: 'go',
      label: 'Go Backend',
      root: 'go-api',
      chat: 'go',
      style: 'snake',
      inbox: 'internal/handler',
      names: ['user', 'order', 'auth', 'health', 'payment', 'session', 'webhook', 'metrics', 'upload', 'search', 'admin', 'report', 'notify', 'cache', 'billing', 'invite'],
      deps: ['github.com/gin-gonic/gin', 'github.com/jackc/pgx/v5', 'go.uber.org/zap', 'github.com/spf13/viper'],
      files: ['.gitignore', '.golangci.yml', 'go.mod', 'go.sum', 'Makefile', 'Dockerfile', 'docker-compose.yml', 'cmd/server/main.go', 'cmd/worker/main.go', 'internal/config/config.go', 'internal/handler/', 'internal/middleware/logging.go', 'internal/middleware/auth.go', 'internal/model/user.go', 'internal/model/order.go', 'internal/service/user_service.go', 'internal/store/postgres.go', 'internal/store/redis.go', 'pkg/logger/logger.go', 'pkg/httputil/response.go', 'migrations/0001_init.sql', 'migrations/0002_orders.sql', 'api/openapi.yaml', 'scripts/dev.sh', 'test/integration_test.go'],
    },
    {
      id: 'aspnet',
      label: 'C# Backend (ASP.NET Core)',
      root: 'WebApi',
      chat: 'cs',
      style: 'pascal',
      inbox: 'WebApi/Services',
      names: ['UserService', 'OrderService', 'AuthService', 'EmailSender', 'CacheService', 'ReportService', 'PaymentService', 'TokenService', 'AuditService', 'StorageService', 'SearchService', 'NotificationHub', 'BackgroundWorker', 'RateLimiter', 'ExportService', 'ImportService'],
      files: ['.gitignore', '.editorconfig', 'WebApi.sln', 'Directory.Build.props', 'Dockerfile', 'WebApi/WebApi.csproj', 'WebApi/Program.cs', 'WebApi/appsettings.json', 'WebApi/appsettings.Development.json', 'WebApi/Properties/launchSettings.json', 'WebApi/Controllers/UsersController.cs', 'WebApi/Controllers/AuthController.cs', 'WebApi/Models/User.cs', 'WebApi/Models/Order.cs', 'WebApi/Dtos/UserDto.cs', 'WebApi/Data/AppDbContext.cs', 'WebApi/Data/Migrations/', 'WebApi/Middleware/ExceptionMiddleware.cs', 'WebApi/Extensions/ServiceCollectionExtensions.cs', 'WebApi/Services/', 'WebApi.Tests/WebApi.Tests.csproj', 'WebApi.Tests/UsersControllerTests.cs', 'WebApi.Tests/AuthServiceTests.cs'],
    },
    {
      id: 'react',
      label: 'Frontend (React + Vite)',
      root: 'web-client',
      chat: 'tsx',
      style: 'pascal',
      inbox: 'src/components',
      names: ['Header', 'Sidebar', 'Navbar', 'Footer', 'Modal', 'UserCard', 'ProfileMenu', 'SearchBar', 'Dropdown', 'Toast', 'Avatar', 'DataTable', 'LoginForm', 'Pagination', 'Tabs', 'Tooltip'],
      deps: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'zustand', 'vite', 'typescript'],
      scripts: { dev: 'vite', build: 'tsc -b && vite build', preview: 'vite preview', lint: 'eslint .' },
      files: ['.gitignore', '.env', '.prettierrc', 'eslint.config.js', 'index.html', 'package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.node.json', 'vite.config.ts', 'public/favicon.svg', 'public/robots.txt', 'src/main.tsx', 'src/App.tsx', 'src/App.css', 'src/index.css', 'src/vite-env.d.ts', 'src/assets/logo.svg', 'src/components/', 'src/pages/Home.tsx', 'src/pages/Login.tsx', 'src/pages/Settings.tsx', 'src/pages/NotFound.tsx', 'src/hooks/useAuth.ts', 'src/hooks/useDebounce.ts', 'src/api/client.ts', 'src/api/users.ts', 'src/store/authStore.ts', 'src/types/index.ts', 'src/utils/format.ts', 'src/styles/theme.css', 'tests/App.test.tsx'],
    },
    {
      id: 'nextjs',
      label: 'Frontend (Next.js)',
      root: 'next-app',
      chat: 'tsx',
      style: 'pascal',
      inbox: 'components',
      names: ['Hero', 'NavBar', 'Footer', 'PricingTable', 'FeatureGrid', 'Testimonials', 'SignInButton', 'ThemeToggle', 'CommandMenu', 'Breadcrumbs', 'EmptyState', 'Skeleton', 'Banner', 'Card', 'Dialog', 'Sheet'],
      deps: ['next', 'react', 'react-dom', 'tailwindcss', 'clsx', 'typescript'],
      scripts: { dev: 'next dev', build: 'next build', start: 'next start', lint: 'next lint' },
      files: ['.gitignore', '.env.local', 'eslint.config.mjs', 'package.json', 'tsconfig.json', 'next.config.mjs', 'next-env.d.ts', 'postcss.config.mjs', 'tailwind.config.ts', 'middleware.ts', 'app/layout.tsx', 'app/page.tsx', 'app/globals.css', 'app/loading.tsx', 'app/not-found.tsx', 'app/api/health/route.ts', 'app/api/auth/route.ts', 'app/dashboard/page.tsx', 'app/dashboard/layout.tsx', 'app/settings/page.tsx', 'components/', 'components/ui/button.tsx', 'components/ui/input.tsx', 'lib/utils.ts', 'lib/db.ts', 'lib/auth.ts', 'hooks/use-media-query.ts', 'types/index.ts', 'public/logo.svg', 'public/og.png'],
    },
    {
      id: 'vue',
      label: 'Frontend (Vue)',
      root: 'vue-app',
      chat: 'ts',
      style: 'camel',
      inbox: 'src/composables',
      names: ['useAuth', 'useCart', 'useFetch', 'useTheme', 'useToast', 'useForm', 'useModal', 'usePagination', 'useSearch', 'useStorage', 'useTimer', 'useWebSocket', 'useUpload', 'useI18n', 'useBreakpoint', 'useDebounce'],
      deps: ['vue', 'vue-router', 'pinia', 'vite', 'typescript'],
      scripts: { dev: 'vite', build: 'vue-tsc && vite build', preview: 'vite preview' },
      files: ['.gitignore', 'index.html', 'package.json', 'tsconfig.json', 'tsconfig.app.json', 'vite.config.ts', 'env.d.ts', 'public/favicon.ico', 'src/main.ts', 'src/App.vue', 'src/router/index.ts', 'src/stores/user.ts', 'src/stores/cart.ts', 'src/components/HelloWorld.vue', 'src/components/AppHeader.vue', 'src/components/AppFooter.vue', 'src/composables/', 'src/views/HomeView.vue', 'src/views/AboutView.vue', 'src/views/LoginView.vue', 'src/api/http.ts', 'src/assets/main.css', 'src/types/index.ts', 'tests/unit/HelloWorld.spec.ts'],
    },
    {
      id: 'unity',
      label: 'Game (Unity, C#)',
      root: 'UnityProject',
      chat: 'cs',
      style: 'pascal',
      inbox: 'Assets/Scripts/Systems',
      names: ['GameManager', 'AudioManager', 'InventorySystem', 'EnemyAI', 'SpawnManager', 'SaveSystem', 'QuestManager', 'DialogueSystem', 'CameraFollow', 'HealthSystem', 'WeaponController', 'InputHandler', 'ScoreManager', 'LevelLoader', 'ObjectPool', 'UIManager'],
      files: ['.gitignore', '.gitattributes', 'Assets/Scenes/SampleScene.unity', 'Assets/Scenes/MainMenu.unity', 'Assets/Scenes/Level01.unity', 'Assets/Scripts/Player/PlayerController.cs', 'Assets/Scripts/Player/PlayerAnimator.cs', 'Assets/Scripts/Player/PlayerInput.cs', 'Assets/Scripts/Enemies/EnemyBase.cs', 'Assets/Scripts/Enemies/EnemySpawner.cs', 'Assets/Scripts/UI/HUD.cs', 'Assets/Scripts/UI/PauseMenu.cs', 'Assets/Scripts/UI/MainMenu.cs', 'Assets/Scripts/Systems/', 'Assets/Scripts/Utils/Singleton.cs', 'Assets/Scripts/Utils/Extensions.cs', 'Assets/Scripts/Game.asmdef', 'Assets/Prefabs/Player.prefab', 'Assets/Prefabs/Enemy.prefab', 'Assets/Prefabs/Bullet.prefab', 'Assets/Materials/Ground.mat', 'Assets/Animations/', 'Assets/Audio/', 'Assets/Sprites/', 'Assets/Resources/', 'Assets/Settings/URP-HighFidelity.asset', 'Assets/Tests/EditMode/PlayerTests.cs', 'Packages/manifest.json', 'Packages/packages-lock.json', 'ProjectSettings/ProjectVersion.txt', 'ProjectSettings/ProjectSettings.asset'],
    },
    {
      id: 'unreal',
      label: 'Game (Unreal Engine, C++)',
      root: 'MyGame',
      chat: 'cpp',
      style: 'pascal',
      inbox: 'Source/MyGame/Gameplay',
      names: ['PlayerCharacter', 'EnemyCharacter', 'WeaponComponent', 'HealthComponent', 'InventoryComponent', 'MyGameMode', 'MyPlayerController', 'Projectile', 'Pickup', 'SpawnVolume', 'DamageType', 'AbilitySystem', 'InteractionComponent', 'SaveGameSubsystem', 'HUDWidget', 'AIControllerBase'],
      files: ['.gitignore', 'MyGame.uproject', 'Config/DefaultEngine.ini', 'Config/DefaultGame.ini', 'Config/DefaultInput.ini', 'Source/MyGame.Target.cs', 'Source/MyGameEditor.Target.cs', 'Source/MyGame/MyGame.Build.cs', 'Source/MyGame/MyGame.cpp', 'Source/MyGame/MyGame.h', 'Source/MyGame/Characters/MyCharacter.cpp', 'Source/MyGame/Characters/MyCharacter.h', 'Source/MyGame/Components/HealthComponent.cpp', 'Source/MyGame/Components/HealthComponent.h', 'Source/MyGame/UI/MainHUD.cpp', 'Source/MyGame/UI/MainHUD.h', 'Source/MyGame/Gameplay/', 'Content/Maps/', 'Content/Blueprints/', 'Content/Materials/', 'Plugins/'],
    },
    {
      id: 'flutter',
      label: 'Mobile (Flutter, Dart)',
      root: 'flutter_app',
      chat: 'dart',
      style: 'snake',
      inbox: 'lib/widgets',
      names: ['user_card', 'chat_bubble', 'settings_tile', 'custom_app_bar', 'profile_header', 'login_form', 'bottom_nav', 'loading_view', 'error_view', 'avatar', 'search_field', 'product_tile', 'cart_badge', 'rating_bar', 'image_carousel', 'empty_state'],
      deps: ['flutter_riverpod', 'go_router', 'dio', 'freezed_annotation', 'shared_preferences'],
      files: ['.gitignore', '.metadata', 'pubspec.yaml', 'pubspec.lock', 'analysis_options.yaml', 'l10n.yaml', 'lib/main.dart', 'lib/app.dart', 'lib/router.dart', 'lib/theme/app_theme.dart', 'lib/screens/home_screen.dart', 'lib/screens/settings_screen.dart', 'lib/screens/login_screen.dart', 'lib/screens/profile_screen.dart', 'lib/widgets/', 'lib/models/user.dart', 'lib/models/post.dart', 'lib/services/api_service.dart', 'lib/services/auth_service.dart', 'lib/providers/user_provider.dart', 'lib/utils/constants.dart', 'lib/l10n/app_en.arb', 'lib/l10n/app_ko.arb', 'test/widget_test.dart', 'test/models/user_test.dart', 'android/build.gradle', 'android/app/build.gradle', 'android/app/src/main/AndroidManifest.xml', 'ios/Podfile', 'ios/Runner/Info.plist', 'ios/Runner/AppDelegate.swift', 'web/index.html', 'assets/images/', 'assets/fonts/'],
    },
    {
      id: 'android',
      label: 'Mobile (Android, Kotlin)',
      root: 'AndroidApp',
      chat: 'kt',
      style: 'pascal',
      inbox: 'app/src/main/java/com/example/app/ui',
      names: ['HomeViewModel', 'LoginFragment', 'ProfileScreen', 'SettingsActivity', 'FeedAdapter', 'ChatViewModel', 'DetailFragment', 'SearchScreen', 'OnboardingActivity', 'CartViewModel', 'MapFragment', 'PlayerScreen', 'CameraActivity', 'NotificationsScreen', 'WalletViewModel', 'MainNavHost'],
      files: ['.gitignore', 'build.gradle.kts', 'settings.gradle.kts', 'gradle.properties', 'gradlew', 'gradle/libs.versions.toml', 'gradle/wrapper/gradle-wrapper.properties', 'app/build.gradle.kts', 'app/proguard-rules.pro', 'app/src/main/AndroidManifest.xml', 'app/src/main/java/com/example/app/MainActivity.kt', 'app/src/main/java/com/example/app/App.kt', 'app/src/main/java/com/example/app/data/UserRepository.kt', 'app/src/main/java/com/example/app/data/local/AppDatabase.kt', 'app/src/main/java/com/example/app/data/remote/ApiService.kt', 'app/src/main/java/com/example/app/di/AppModule.kt', 'app/src/main/java/com/example/app/ui/', 'app/src/main/java/com/example/app/ui/theme/Theme.kt', 'app/src/main/res/layout/activity_main.xml', 'app/src/main/res/values/strings.xml', 'app/src/main/res/values/colors.xml', 'app/src/main/res/values/themes.xml', 'app/src/main/res/drawable/', 'app/src/test/java/com/example/app/ExampleUnitTest.kt', 'app/src/androidTest/java/com/example/app/ExampleInstrumentedTest.kt'],
    },
    {
      id: 'ios',
      label: 'Mobile (iOS, Swift)',
      root: 'MyApp',
      chat: 'swift',
      style: 'pascal',
      inbox: 'MyApp/Views',
      names: ['ProfileView', 'SettingsView', 'FeedView', 'LoginView', 'DetailView', 'SearchView', 'OnboardingView', 'CartView', 'MapView', 'PlayerView', 'CameraView', 'NotificationsView', 'WalletView', 'TabBarView', 'ChatView', 'AboutView'],
      files: ['.gitignore', 'Package.swift', 'MyApp.xcodeproj/project.pbxproj', 'MyApp/MyAppApp.swift', 'MyApp/ContentView.swift', 'MyApp/Views/', 'MyApp/Views/Components/PrimaryButton.swift', 'MyApp/Models/User.swift', 'MyApp/Models/Post.swift', 'MyApp/ViewModels/HomeViewModel.swift', 'MyApp/ViewModels/ProfileViewModel.swift', 'MyApp/Services/APIClient.swift', 'MyApp/Services/AuthService.swift', 'MyApp/Extensions/View+Extensions.swift', 'MyApp/Resources/Assets.xcassets/', 'MyApp/Resources/Localizable.strings', 'MyApp/Info.plist', 'MyAppTests/MyAppTests.swift', 'MyAppUITests/MyAppUITests.swift'],
    },
    {
      id: 'cpp',
      label: 'C++ (CMake)',
      root: 'cpp-engine',
      chat: 'cpp',
      style: 'snake',
      inbox: 'src/core',
      names: ['engine', 'renderer', 'parser', 'scheduler', 'thread_pool', 'allocator', 'logger', 'network', 'socket', 'buffer', 'timer', 'event_loop', 'serializer', 'compressor', 'matrix', 'cache'],
      files: ['.gitignore', '.clang-format', 'CMakeLists.txt', 'CMakePresets.json', 'conanfile.txt', 'include/engine/config.hpp', 'include/engine/types.hpp', 'include/engine/engine.hpp', 'include/engine/math/vec3.hpp', 'src/main.cpp', 'src/core/', 'src/math/vec3.cpp', 'src/platform/window.cpp', 'src/platform/input.cpp', 'src/render/shader.cpp', 'src/render/mesh.cpp', 'tests/CMakeLists.txt', 'tests/test_main.cpp', 'tests/test_math.cpp', 'shaders/basic.vert', 'shaders/basic.frag', 'third_party/', 'docs/design.md'],
    },
    {
      id: 'c',
      label: 'C (Embedded, Makefile)',
      root: 'firmware',
      chat: 'c',
      style: 'snake',
      inbox: 'src/drivers',
      names: ['uart', 'spi', 'i2c', 'gpio', 'timer', 'adc', 'pwm', 'dma', 'flash', 'watchdog', 'can_bus', 'rtc', 'usb', 'eeprom', 'sensor', 'motor'],
      files: ['.gitignore', '.clang-format', 'Makefile', 'linker.ld', 'include/config.h', 'include/board.h', 'include/drivers/uart.h', 'include/drivers/spi.h', 'include/hal/gpio.h', 'src/main.c', 'src/startup.c', 'src/system.c', 'src/drivers/', 'src/hal/gpio.c', 'src/hal/clock.c', 'src/hal/interrupts.c', 'src/app/scheduler.c', 'src/app/state_machine.c', 'tests/test_ring_buffer.c', 'tools/flash.sh', 'docs/pinout.md'],
    },
    {
      id: 'rust',
      label: 'Rust (Cargo)',
      root: 'rust-cli',
      chat: 'rs',
      style: 'snake',
      inbox: 'src/commands',
      names: ['init', 'build', 'deploy', 'status', 'config', 'login', 'sync', 'watch', 'clean', 'fetch', 'publish', 'doctor', 'logs', 'upgrade', 'search', 'export'],
      deps: ['clap', 'serde', 'tokio', 'anyhow', 'reqwest', 'tracing'],
      files: ['.gitignore', 'Cargo.toml', 'Cargo.lock', 'rustfmt.toml', 'build.rs', '.github/workflows/ci.yml', 'src/main.rs', 'src/lib.rs', 'src/cli.rs', 'src/config.rs', 'src/error.rs', 'src/commands/mod.rs', 'src/api/mod.rs', 'src/api/client.rs', 'src/utils/mod.rs', 'src/utils/fs.rs', 'tests/integration.rs', 'tests/cli.rs', 'benches/bench_main.rs', 'examples/basic.rs'],
    },
    {
      id: 'laravel',
      label: 'PHP Backend (Laravel)',
      root: 'laravel-app',
      chat: 'php',
      style: 'pascal',
      inbox: 'app/Http/Controllers',
      names: ['UserController', 'OrderController', 'AuthController', 'ProductController', 'CartController', 'PaymentController', 'ProfileController', 'PostController', 'CommentController', 'AdminController', 'ReportController', 'SettingsController', 'MediaController', 'SearchController', 'InvoiceController', 'TagController'],
      deps: ['laravel/framework', 'laravel/sanctum', 'guzzlehttp/guzzle'],
      npm: ['vite', 'laravel-vite-plugin', 'axios', 'tailwindcss'],
      scripts: { dev: 'vite', build: 'vite build' },
      files: ['.gitignore', '.env.example', '.editorconfig', 'artisan', 'composer.json', 'composer.lock', 'package.json', 'vite.config.js', 'phpunit.xml', 'app/Models/User.php', 'app/Models/Post.php', 'app/Http/Controllers/Controller.php', 'app/Http/Middleware/Authenticate.php', 'app/Http/Requests/StoreUserRequest.php', 'app/Providers/AppServiceProvider.php', 'app/Services/PaymentService.php', 'bootstrap/app.php', 'config/app.php', 'config/auth.php', 'config/database.php', 'routes/web.php', 'routes/api.php', 'routes/console.php', 'resources/views/welcome.blade.php', 'resources/views/layouts/app.blade.php', 'resources/css/app.css', 'resources/js/app.js', 'database/migrations/2024_01_01_000000_create_users_table.php', 'database/seeders/DatabaseSeeder.php', 'database/factories/UserFactory.php', 'storage/', 'public/index.php', 'tests/Feature/ExampleTest.php', 'tests/Unit/ExampleTest.php'],
    },
    {
      id: 'rails',
      label: 'Ruby on Rails',
      root: 'rails-app',
      chat: 'rb',
      style: 'snake',
      inbox: 'app/controllers',
      names: ['users_controller', 'sessions_controller', 'orders_controller', 'products_controller', 'carts_controller', 'payments_controller', 'posts_controller', 'comments_controller', 'admin_controller', 'reports_controller', 'settings_controller', 'search_controller', 'invoices_controller', 'tags_controller', 'uploads_controller', 'webhooks_controller'],
      deps: ['rails', 'pg', 'puma', 'sidekiq', 'devise', 'rspec-rails'],
      files: ['.gitignore', '.ruby-version', 'Gemfile', 'Gemfile.lock', 'Rakefile', 'config.ru', 'Procfile', 'config/routes.rb', 'config/application.rb', 'config/database.yml', 'config/environments/development.rb', 'config/environments/production.rb', 'config/initializers/cors.rb', 'app/controllers/application_controller.rb', 'app/models/application_record.rb', 'app/models/user.rb', 'app/models/post.rb', 'app/views/layouts/application.html.erb', 'app/views/posts/index.html.erb', 'app/jobs/application_job.rb', 'app/mailers/user_mailer.rb', 'app/helpers/application_helper.rb', 'db/schema.rb', 'db/seeds.rb', 'db/migrate/20240101000000_create_users.rb', 'lib/tasks/', 'spec/rails_helper.rb', 'spec/models/user_spec.rb', 'spec/requests/posts_spec.rb'],
    },
    {
      id: 'love2d',
      label: 'Game (LÖVE, Lua)',
      root: 'lua-game',
      chat: 'lua',
      style: 'snake',
      inbox: 'src/entities',
      names: ['player', 'enemy', 'bullet', 'pickup', 'boss', 'particle', 'camera', 'tilemap', 'spawner', 'hud', 'door', 'platform', 'coin', 'trap', 'npc', 'projectile'],
      files: ['.gitignore', 'main.lua', 'conf.lua', 'src/game.lua', 'src/states/menu.lua', 'src/states/play.lua', 'src/states/gameover.lua', 'src/entities/', 'src/systems/physics.lua', 'src/systems/collision.lua', 'src/ui/button.lua', 'src/ui/hud.lua', 'lib/json.lua', 'lib/class.lua', 'lib/anim8.lua', 'assets/sprites/', 'assets/sounds/', 'assets/fonts/', 'assets/maps/level1.lua', 'tests/test_collision.lua'],
    },
  ]
  const EXTRA = {
    'python-backend': {
      'src/api/': 'middleware.py errors.py',
      'src/api/routes/': 'orders.py payments.py webhooks.py admin.py',
      'src/core/': 'cache.py events.py exceptions.py',
      'src/models/': 'base.py payment.py session.py audit_log.py',
      'src/schemas/': 'order.py auth.py common.py pagination.py',
      'src/services/': 'user_service.py order_service.py payment_service.py notification.py storage.py',
      'src/handlers/': 'base.py registry.py',
      'src/utils/': 'crypto.py pagination.py validators.py',
      'src/workers/': '__init__.py celery_app.py tasks.py',
      'alembic/': 'script.py.mako',
      'alembic/versions/': '0002_add_orders.py 0003_add_payments.py 0004_audit_log.py',
      'tests/': 'test_auth.py test_orders.py test_payments.py',
      'tests/fixtures/': 'users.json orders.json',
      'scripts/': 'create_admin.py export_users.py',
      'docs/': 'api.md deployment.md',
      '.github/workflows/': 'release.yml',
    },
    'django': {
      'apps/core/': 'views.py serializers.py tests.py signals.py',
      'apps/accounts/': 'admin.py apps.py urls.py serializers.py signals.py',
      'apps/accounts/migrations/': '__init__.py 0001_initial.py 0002_profile.py',
      'apps/orders/': '__init__.py apps.py models.py views.py urls.py admin.py serializers.py tests.py',
      'apps/orders/migrations/': '__init__.py 0001_initial.py',
      'templates/': '404.html 500.html',
      'templates/accounts/': 'signup.html profile.html',
      'templates/orders/': 'list.html detail.html',
      'static/css/': 'admin.css',
      'static/js/': 'dashboard.js',
      'static/img/': 'logo.svg favicon.ico',
      'locale/ko/LC_MESSAGES/': 'django.po',
      'scripts/': 'entrypoint.sh',
    },
    'node-backend': {
      'src/routes/': 'orders.ts payments.ts health.ts',
      'src/controllers/': 'orderController.ts healthController.ts',
      'src/middleware/': 'rateLimit.ts validate.ts requestId.ts',
      'src/models/': 'order.ts session.ts',
      'src/services/': 'index.ts',
      'src/utils/': 'crypto.ts pagination.ts asyncHandler.ts',
      'src/jobs/': 'emailQueue.ts cleanup.ts',
      'src/config/': 'database.ts redis.ts',
      'src/types/': 'index.ts',
      'prisma/migrations/20240101120000_init/': 'migration.sql',
      'prisma/migrations/20240215093000_add_orders/': 'migration.sql',
      'tests/': 'auth.test.ts orders.test.ts setup.ts',
      'scripts/': 'seed.ts',
    },
    'spring': {
      'src/main/java/com/example/demo/controller/': 'OrderController.java HealthController.java',
      'src/main/java/com/example/demo/domain/': 'Payment.java Role.java BaseEntity.java',
      'src/main/java/com/example/demo/dto/': 'UserRequest.java OrderResponse.java ErrorResponse.java',
      'src/main/java/com/example/demo/exception/': 'NotFoundException.java BadRequestException.java',
      'src/main/java/com/example/demo/repository/': 'PaymentRepository.java',
      'src/main/java/com/example/demo/config/': 'JpaConfig.java RedisConfig.java OpenApiConfig.java',
      'src/main/java/com/example/demo/security/': 'JwtTokenProvider.java JwtAuthenticationFilter.java CustomUserDetailsService.java',
      'src/main/java/com/example/demo/service/': 'package-info.java',
      'src/main/java/com/example/demo/util/': 'DateUtils.java',
      'src/main/resources/': 'application-prod.yml logback-spring.xml messages.properties',
      'src/main/resources/db/migration/': 'V2__add_orders.sql V3__add_payments.sql',
      'src/main/resources/static/': 'index.html',
      'src/main/resources/static/css/': 'style.css',
      'src/main/resources/templates/': 'index.html error.html',
      'src/test/java/com/example/demo/service/': 'UserServiceTest.java',
      'src/test/java/com/example/demo/repository/': 'UserRepositoryTest.java',
    },
    'go': {
      'internal/handler/': 'router.go',
      'internal/middleware/': 'cors.go recover.go',
      'internal/model/': 'payment.go session.go',
      'internal/service/': 'order_service.go auth_service.go',
      'internal/store/': 'user_store.go order_store.go migrations.go',
      'internal/config/': 'env.go',
      'pkg/logger/': 'fields.go',
      'pkg/httputil/': 'errors.go',
      'migrations/': '0003_payments.sql',
      'api/proto/': 'user.proto',
      'scripts/': 'migrate.sh',
      'deployments/k8s/': 'deployment.yaml service.yaml',
      'test/': 'helpers_test.go',
    },
    'aspnet': {
      'WebApi/Controllers/': 'OrdersController.cs HealthController.cs',
      'WebApi/Models/': 'Payment.cs Role.cs',
      'WebApi/Dtos/': 'OrderDto.cs CreateUserRequest.cs LoginRequest.cs',
      'WebApi/Data/Configurations/': 'UserConfiguration.cs',
      'WebApi/Data/Migrations/': '20240101000000_Initial.cs AppDbContextModelSnapshot.cs',
      'WebApi/Middleware/': 'RequestLoggingMiddleware.cs',
      'WebApi/Extensions/': 'ClaimsPrincipalExtensions.cs',
      'WebApi/Services/': 'IUserService.cs',
      'WebApi/Validators/': 'CreateUserRequestValidator.cs',
      'WebApi/wwwroot/': 'favicon.ico',
      'WebApi.Tests/': 'OrdersControllerTests.cs TestFixture.cs',
    },
    'react': {
      'src/components/': 'Button.tsx Layout.tsx index.ts',
      'src/components/ui/': 'Card.tsx Input.tsx Spinner.tsx',
      'src/pages/': 'Profile.tsx Dashboard.tsx',
      'src/hooks/': 'useLocalStorage.ts useFetch.ts',
      'src/api/': 'auth.ts orders.ts',
      'src/store/': 'uiStore.ts',
      'src/types/': 'api.ts',
      'src/utils/': 'date.ts classNames.ts',
      'src/styles/': 'variables.css',
      'src/assets/': 'hero.png',
      'src/assets/icons/': 'check.svg close.svg',
      'src/routes/': 'index.tsx ProtectedRoute.tsx',
      'src/context/': 'ThemeContext.tsx',
      'tests/': 'setup.ts Login.test.tsx',
    },
    'nextjs': {
      'app/': 'favicon.ico',
      'app/(auth)/login/': 'page.tsx',
      'app/(auth)/register/': 'page.tsx',
      'app/blog/': 'page.tsx',
      'app/blog/[slug]/': 'page.tsx',
      'app/api/users/': 'route.ts',
      'app/dashboard/settings/': 'page.tsx',
      'components/': 'header.tsx footer.tsx',
      'components/ui/': 'card.tsx dialog.tsx dropdown-menu.tsx',
      'lib/': 'validations.ts constants.ts',
      'hooks/': 'use-debounce.ts',
      'types/': 'api.ts',
      'public/images/': 'hero.jpg',
      'prisma/': 'schema.prisma',
    },
    'vue': {
      'src/components/': 'AppButton.vue BaseModal.vue TodoItem.vue',
      'src/composables/': 'index.ts',
      'src/views/': 'DashboardView.vue SettingsView.vue NotFoundView.vue',
      'src/stores/': 'auth.ts',
      'src/router/': 'guards.ts',
      'src/api/': 'users.ts orders.ts',
      'src/assets/': 'logo.svg base.css',
      'src/layouts/': 'DefaultLayout.vue AuthLayout.vue',
      'src/utils/': 'format.ts',
      'tests/unit/': 'TodoItem.spec.ts',
      'tests/e2e/': 'login.cy.ts',
    },
    'unity': {
      'Assets/Scripts/Player/': 'PlayerHealth.cs PlayerCombat.cs PlayerStats.cs PlayerInventory.cs',
      'Assets/Scripts/Enemies/': 'EnemyController.cs EnemyHealth.cs BossController.cs EnemyPatrol.cs',
      'Assets/Scripts/UI/': 'HealthBar.cs DamagePopup.cs InventoryUI.cs SettingsMenu.cs Tooltip.cs',
      'Assets/Scripts/Systems/': 'ISaveable.cs SystemsBootstrap.cs',
      'Assets/Scripts/Managers/': 'GameStateManager.cs SceneTransition.cs PoolManager.cs',
      'Assets/Scripts/Weapons/': 'Weapon.cs Projectile.cs WeaponData.cs Pistol.cs Shotgun.cs',
      'Assets/Scripts/Items/': 'Item.cs ItemData.cs Collectible.cs Chest.cs',
      'Assets/Scripts/Data/': 'GameSettings.cs LevelData.cs',
      'Assets/Scripts/Utils/': 'Timer.cs MathUtils.cs',
      'Assets/Scripts/Editor/': 'LevelEditorWindow.cs',
      'Assets/Prefabs/': 'Pickup.prefab',
      'Assets/Prefabs/UI/': 'HUD.prefab PauseMenu.prefab',
      'Assets/Prefabs/Effects/': 'Explosion.prefab MuzzleFlash.prefab',
      'Assets/Materials/': 'Player.mat Enemy.mat Water.mat Skybox.mat',
      'Assets/Animations/Player/': 'Idle.anim Run.anim Jump.anim Player.controller',
      'Assets/Animations/Enemy/': 'Attack.anim Walk.anim Enemy.controller',
      'Assets/Audio/Music/': 'MainTheme.ogg BattleTheme.ogg',
      'Assets/Audio/SFX/': 'Jump.wav Hit.wav Coin.wav Explosion.wav',
      'Assets/Audio/Mixer/': 'MainMixer.mixer',
      'Assets/Sprites/UI/': 'Button.png Panel.png',
      'Assets/Sprites/Icons/': 'Coin.png Heart.png',
      'Assets/Sprites/Characters/': 'Player.png',
      'Assets/Resources/Items/': 'HealthPotion.asset Sword.asset',
      'Assets/Resources/Config/': 'GameSettings.asset',
      'Assets/Settings/': 'URP-Balanced.asset UniversalRenderPipelineGlobalSettings.asset PlayerControls.inputactions',
      'Assets/Scenes/': 'Level02.unity Boss.unity',
      'Assets/Shaders/': 'Outline.shader Dissolve.shadergraph Water.shader',
      'Assets/Models/': 'Player.fbx Enemy.fbx',
      'Assets/Models/Props/': 'Crate.fbx Barrel.fbx',
      'Assets/Fonts/': 'Roboto-Regular.ttf',
      'Assets/Plugins/DOTween/': 'DOTween.dll',
      'Assets/Tests/EditMode/': 'EnemyTests.cs EditModeTests.asmdef',
      'Assets/Tests/PlayMode/': 'PlayerMovementTests.cs PlayModeTests.asmdef',
      'ProjectSettings/': 'InputManager.asset TagManager.asset QualitySettings.asset GraphicsSettings.asset EditorBuildSettings.asset',
    },
    'unreal': {
      'Source/MyGame/Characters/': 'EnemyCharacter.cpp EnemyCharacter.h',
      'Source/MyGame/Components/': 'InventoryComponent.cpp InventoryComponent.h CombatComponent.cpp CombatComponent.h',
      'Source/MyGame/Gameplay/': 'MyGameState.cpp MyGameState.h',
      'Source/MyGame/UI/': 'InventoryWidget.cpp InventoryWidget.h',
      'Source/MyGame/Weapons/': 'WeaponBase.cpp WeaponBase.h ProjectileBase.cpp ProjectileBase.h',
      'Source/MyGame/AI/': 'EnemyAIController.cpp EnemyAIController.h BTTask_FindPatrolPoint.cpp BTTask_FindPatrolPoint.h',
      'Content/Maps/': 'MainMenu.umap Level_01.umap',
      'Content/Blueprints/': 'BP_Player.uasset BP_Enemy.uasset BP_GameMode.uasset',
      'Content/Materials/': 'M_Base.uasset MI_Character.uasset',
      'Content/UI/': 'WBP_HUD.uasset WBP_MainMenu.uasset',
      'Content/Audio/': 'SC_Footsteps.uasset',
      'Config/': 'DefaultEditor.ini',
      'Plugins/MyPlugin/': 'MyPlugin.uplugin',
    },
    'flutter': {
      'lib/screens/': 'chat_screen.dart search_screen.dart onboarding_screen.dart',
      'lib/widgets/': 'widgets.dart',
      'lib/models/': 'comment.dart app_state.dart',
      'lib/services/': 'storage_service.dart notification_service.dart',
      'lib/providers/': 'auth_provider.dart theme_provider.dart',
      'lib/utils/': 'validators.dart extensions.dart',
      'lib/theme/': 'colors.dart text_styles.dart',
      'lib/data/repositories/': 'user_repository.dart post_repository.dart',
      'assets/images/': 'logo.png splash.png placeholder.png',
      'assets/fonts/': 'Pretendard-Regular.otf Pretendard-Bold.otf',
      'test/services/': 'api_service_test.dart',
      'integration_test/': 'app_test.dart',
      'android/': 'settings.gradle gradle.properties',
      'android/app/src/main/kotlin/com/example/app/': 'MainActivity.kt',
      'ios/Runner/Base.lproj/': 'Main.storyboard LaunchScreen.storyboard',
      'web/': 'manifest.json favicon.png',
      'macos/Runner/': 'AppDelegate.swift',
    },
    'android': {
      'app/src/main/java/com/example/app/ui/components/': 'LoadingIndicator.kt ErrorView.kt',
      'app/src/main/java/com/example/app/ui/home/': 'HomeScreen.kt',
      'app/src/main/java/com/example/app/ui/theme/': 'Color.kt Type.kt',
      'app/src/main/java/com/example/app/data/model/': 'User.kt Post.kt',
      'app/src/main/java/com/example/app/data/local/': 'UserDao.kt Converters.kt',
      'app/src/main/java/com/example/app/data/remote/': 'AuthInterceptor.kt',
      'app/src/main/java/com/example/app/data/remote/dto/': 'UserDto.kt',
      'app/src/main/java/com/example/app/data/repository/': 'PostRepository.kt',
      'app/src/main/java/com/example/app/di/': 'NetworkModule.kt DatabaseModule.kt',
      'app/src/main/java/com/example/app/util/': 'Extensions.kt DateFormatter.kt Result.kt',
      'app/src/main/res/drawable/': 'ic_launcher_background.xml ic_logo.xml',
      'app/src/main/res/mipmap-hdpi/': 'ic_launcher.png',
      'app/src/main/res/mipmap-xhdpi/': 'ic_launcher.png',
      'app/src/main/res/values/': 'dimens.xml',
      'app/src/main/res/xml/': 'network_security_config.xml',
      'app/src/main/res/navigation/': 'nav_graph.xml',
      'app/src/main/res/layout/': 'fragment_home.xml item_post.xml',
      'app/src/test/java/com/example/app/': 'UserRepositoryTest.kt',
      'gradle/wrapper/': 'gradle-wrapper.jar',
    },
    'ios': {
      'MyApp/Views/Components/': 'AvatarView.swift LoadingView.swift',
      'MyApp/Models/': 'Comment.swift AppError.swift',
      'MyApp/ViewModels/': 'LoginViewModel.swift FeedViewModel.swift',
      'MyApp/Services/': 'KeychainService.swift ImageCache.swift NetworkMonitor.swift',
      'MyApp/Extensions/': 'Color+Theme.swift Date+Formatting.swift',
      'MyApp/Utilities/': 'Constants.swift Logger.swift',
      'MyApp/Resources/Assets.xcassets/AppIcon.appiconset/': 'Contents.json',
      'MyApp/Resources/Assets.xcassets/AccentColor.colorset/': 'Contents.json',
      'MyApp/Preview Content/Preview Assets.xcassets/': 'Contents.json',
      'MyApp/': 'MyApp.entitlements',
      'MyAppTests/': 'APIClientTests.swift HomeViewModelTests.swift',
      'MyAppUITests/': 'LaunchTests.swift',
      'MyApp.xcodeproj/xcshareddata/xcschemes/': 'MyApp.xcscheme',
    },
    'cpp': {
      'include/engine/': 'renderer.hpp window.hpp input.hpp logger.hpp',
      'include/engine/math/': 'mat4.hpp quat.hpp',
      'src/core/': 'application.cpp',
      'src/render/': 'renderer.cpp texture.cpp camera.cpp framebuffer.cpp',
      'src/platform/': 'filesystem.cpp timer.cpp',
      'src/math/': 'mat4.cpp',
      'src/scene/': 'scene.cpp entity.cpp component.cpp',
      'assets/textures/': 'brick.png',
      'assets/models/': 'cube.obj',
      'shaders/': 'lighting.vert lighting.frag shadow.vert',
      'tests/': 'test_renderer.cpp',
      'third_party/glfw/': 'CMakeLists.txt',
      'third_party/glm/': 'CMakeLists.txt',
      'third_party/stb/': 'stb_image.h',
      'tools/': 'format.sh',
      'docs/': 'build.md',
    },
    'c': {
      'include/drivers/': 'i2c.h gpio_expander.h',
      'include/hal/': 'clock.h interrupts.h',
      'include/app/': 'scheduler.h state_machine.h ring_buffer.h',
      'src/drivers/': 'driver_registry.c',
      'src/hal/': 'systick.c flash.c',
      'src/app/': 'ring_buffer.c commands.c sensors.c',
      'src/lib/': 'crc16.c printf.c',
      'tests/': 'test_scheduler.c',
      'tests/unity/': 'unity.c unity.h',
      'tools/': 'openocd.cfg',
      'docs/': 'memory_map.md',
    },
    'rust': {
      'src/': 'logging.rs state.rs',
      'src/commands/': 'helpers.rs',
      'src/api/': 'models.rs auth.rs',
      'src/utils/': 'term.rs time.rs',
      'tests/fixtures/': 'config.toml',
      'benches/': 'parse.rs',
      'examples/': 'with_config.rs',
      'docs/': 'architecture.md',
    },
    'laravel': {
      'app/Http/Controllers/Auth/': 'LoginController.php RegisterController.php',
      'app/Models/': 'Comment.php Order.php',
      'app/Http/Middleware/': 'EnsureEmailIsVerified.php',
      'app/Http/Requests/': 'UpdateUserRequest.php',
      'app/Http/Resources/': 'UserResource.php PostResource.php',
      'app/Policies/': 'PostPolicy.php',
      'app/Jobs/': 'SendWelcomeEmail.php',
      'app/Mail/': 'WelcomeMail.php',
      'app/Events/': 'OrderShipped.php',
      'app/Listeners/': 'SendShipmentNotification.php',
      'config/': 'cache.php mail.php queue.php services.php',
      'routes/': 'channels.php',
      'resources/views/': 'dashboard.blade.php',
      'resources/views/components/': 'button.blade.php',
      'resources/views/posts/': 'index.blade.php show.blade.php',
      'database/migrations/': '2024_01_02_000000_create_posts_table.php 2024_01_03_000000_create_comments_table.php',
      'database/factories/': 'PostFactory.php',
      'database/seeders/': 'PostSeeder.php',
      'storage/logs/': 'laravel.log',
      'public/': 'favicon.ico robots.txt',
      'tests/Feature/': 'AuthTest.php PostTest.php',
    },
    'rails': {
      'app/controllers/concerns/': 'authenticatable.rb',
      'app/models/': 'comment.rb order.rb',
      'app/models/concerns/': 'sluggable.rb',
      'app/views/posts/': 'show.html.erb _form.html.erb',
      'app/views/users/': 'show.html.erb',
      'app/views/shared/': '_navbar.html.erb',
      'app/jobs/': 'send_digest_job.rb',
      'app/mailers/': 'application_mailer.rb',
      'app/helpers/': 'posts_helper.rb',
      'app/assets/stylesheets/': 'application.css',
      'app/javascript/': 'application.js',
      'app/javascript/controllers/': 'hello_controller.js',
      'app/services/': 'payment_processor.rb',
      'config/': 'puma.rb storage.yml credentials.yml.enc',
      'config/locales/': 'en.yml ko.yml',
      'config/initializers/': 'sidekiq.rb',
      'db/migrate/': '20240102000000_create_posts.rb 20240103000000_create_comments.rb',
      'lib/tasks/': 'cleanup.rake',
      'spec/': 'spec_helper.rb',
      'spec/factories/': 'users.rb',
      'spec/models/': 'post_spec.rb',
    },
    'love2d': {
      'src/entities/': 'entity.lua',
      'src/states/': 'pause.lua',
      'src/systems/': 'render.lua input.lua audio.lua',
      'src/ui/': 'menu_list.lua dialog.lua',
      'src/utils/': 'vector.lua timer.lua',
      'lib/': 'bump.lua tween.lua',
      'assets/sprites/': 'player.png enemy.png tileset.png',
      'assets/sounds/': 'jump.wav coin.wav music.ogg',
      'assets/fonts/': 'pixel.ttf',
      'assets/maps/': 'level2.lua',
      'assets/shaders/': 'crt.glsl',
    },
  }
  for (const t of LIST) for (const [folder, names] of Object.entries(EXTRA[t.id] ?? {})) for (const name of names.split(' ')) if (!t.files.includes(folder + name)) t.files.push(folder + name)

  const BY_ID = new Map(LIST.map((t) => [t.id, t]))
  const get = (id) => BY_ID.get(id) ?? LIST[0]

  const base = (p) => p.slice(p.lastIndexOf('/') + 1)
  const stemOf = (p) => base(p).replace(/\.[^.]*$/, '')
  const words = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/[\s_\-.]+/).filter(Boolean)
  const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1)
  const styled = (s, style) => {
    const w = words(s).map((x) => x.toLowerCase())
    if (!w.length) return s
    if (style === 'pascal') return w.map(cap).join('')
    if (style === 'camel') return w[0] + w.slice(1).map(cap).join('')
    if (style === 'kebab') return w.join('-')
    return w.join('_')
  }

  const version = (name) => {
    const h = CAMO.hash(name)
    return `${1 + (h % 6)}.${(h >>> 4) % 20}.${(h >>> 9) % 10}`
  }
  const IGNORE = {
    'python-backend': ['__pycache__/', '*.pyc', '.venv/', '.env', '.pytest_cache/', 'dist/', 'build/', '*.egg-info/'],
    django: ['__pycache__/', '*.pyc', '.venv/', '.env', 'db.sqlite3', 'staticfiles/', 'media/'],
    unity: ['/[Ll]ibrary/', '/[Tt]emp/', '/[Oo]bj/', '/[Bb]uild/', '/[Bb]uilds/', '/[Ll]ogs/', '/[Uu]ser[Ss]ettings/', '*.csproj', '*.sln', '.vs/'],
    unreal: ['Binaries/', 'DerivedDataCache/', 'Intermediate/', 'Saved/', '.vs/', '*.sln'],
    flutter: ['.dart_tool/', '.packages', 'build/', '.flutter-plugins', '.flutter-plugins-dependencies', '*.iml'],
    android: ['*.iml', '.gradle/', '/local.properties', '/.idea/', '/build/', '/captures/', '.externalNativeBuild/'],
    ios: ['xcuserdata/', 'DerivedData/', '*.xcuserstate', 'Pods/', '.build/'],
    aspnet: ['bin/', 'obj/', '.vs/', '*.user', 'appsettings.*.local.json'],
    spring: ['target/', '.idea/', '*.iml', '.mvn/wrapper/maven-wrapper.jar', 'HELP.md'],
    go: ['/bin/', '*.exe', '*.test', '*.out', 'vendor/', '.env'],
    cpp: ['build/', 'cmake-build-*/', '*.o', '*.a', 'compile_commands.json'],
    c: ['build/', '*.o', '*.elf', '*.bin', '*.hex', '*.map'],
    rust: ['/target/', '**/*.rs.bk'],
    laravel: ['/vendor/', '/node_modules/', '.env', '/storage/*.key', '/public/hot'],
    rails: ['/.bundle', '/log/*', '/tmp/*', '/storage/*', '/public/assets', '.env'],
    love2d: ['*.love', 'build/', '.DS_Store'],
  }

  const NAMED = {
    '.gitignore': (ws, t) => IGNORE[t.id] ?? ['node_modules/', 'dist/', '.env', '.env.local', 'coverage/', '*.log', '.DS_Store'],
    'requirements.txt': (ws, t) => (t.deps ?? []).map((d) => `${d}==${version(d)}`),
    'pyproject.toml': (ws) => ['[project]', `name = "${ws.root}"`, 'version = "0.4.2"', 'requires-python = ">=3.11"', '', '[tool.pytest.ini_options]', 'testpaths = ["tests"]', '', '[tool.ruff]', 'line-length = 120'],
    'manage.py': () => ['#!/usr/bin/env python', 'import os', 'import sys', '', '', 'def main():', '    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")', '    from django.core.management import execute_from_command_line', '', '    execute_from_command_line(sys.argv)', '', '', 'if __name__ == "__main__":', '    main()'],
    'package.json': (ws, t) => {
      const scripts = Object.entries(t.scripts ?? { dev: 'node src/index.js', test: 'vitest' })
      const deps = t.npm ?? t.deps ?? []
      return [
        '{',
        `  "name": "${ws.root}",`,
        '  "version": "0.1.0",',
        '  "private": true,',
        '  "type": "module",',
        '  "scripts": {',
        ...scripts.map(([k, v], i) => `    "${k}": "${v}"${i < scripts.length - 1 ? ',' : ''}`),
        '  },',
        '  "dependencies": {',
        ...deps.map((d, i) => `    "${d}": "^${version(d)}"${i < deps.length - 1 ? ',' : ''}`),
        '  }',
        '}',
      ]
    },
    'tsconfig.json': () => ['{', '  "compilerOptions": {', '    "target": "ES2022",', '    "module": "ESNext",', '    "moduleResolution": "bundler",', '    "strict": true,', '    "jsx": "react-jsx",', '    "skipLibCheck": true,', '    "outDir": "dist"', '  },', '  "include": ["src"]', '}'],
    'vite.config.ts': (ws, t) => (t.id === 'vue' ? ["import { defineConfig } from 'vite'", "import vue from '@vitejs/plugin-vue'", '', 'export default defineConfig({', '  plugins: [vue()],', '})'] : ["import { defineConfig } from 'vite'", "import react from '@vitejs/plugin-react'", '', 'export default defineConfig({', '  plugins: [react()],', '  server: { port: 5173 },', '})']),
    'next.config.mjs': () => ['/** @type {import(\'next\').NextConfig} */', 'const nextConfig = {', '  reactStrictMode: true,', '  images: { remotePatterns: [{ hostname: \'images.example.com\' }] },', '}', '', 'export default nextConfig'],
    'go.mod': (ws, t) => [`module github.com/acme/${ws.root}`, '', 'go 1.22', '', 'require (', ...(t.deps ?? []).map((d) => `\t${d} v${version(d)}`), ')'],
    'go.sum': (ws, t) => (t.deps ?? []).map((d) => `${d} v${version(d)} h1:${CAMO.hash(d).toString(36)}Xq9vPZ0b1kLmN7rT${CAMO.hash(d + 'x').toString(36)}=`),
    'Cargo.toml': (ws, t) => ['[package]', `name = "${ws.root}"`, 'version = "0.3.1"', 'edition = "2021"', '', '[dependencies]', ...(t.deps ?? []).map((d) => `${d} = "${version(d).split('.').slice(0, 2).join('.')}"`)],
    'Cargo.lock': (ws, t) => ['# This file is automatically @generated by Cargo.', '# It is not intended for manual editing.', 'version = 3', '', ...(t.deps ?? []).flatMap((d) => ['[[package]]', `name = "${d}"`, `version = "${version(d)}"`, ''])],
    'pom.xml': (ws, t) => ['<?xml version="1.0" encoding="UTF-8"?>', '<project xmlns="http://maven.apache.org/POM/4.0.0">', '    <modelVersion>4.0.0</modelVersion>', '    <groupId>com.example</groupId>', `    <artifactId>${ws.root}</artifactId>`, '    <version>0.0.1-SNAPSHOT</version>', '    <properties>', '        <java.version>21</java.version>', '    </properties>', '    <dependencies>', ...(t.deps ?? []).flatMap((d) => ['        <dependency>', `            <artifactId>${d}</artifactId>`, '        </dependency>']), '    </dependencies>', '</project>'],
    mvnw: () => ['#!/bin/sh', '# Apache Maven Wrapper startup script', 'set -e', 'MAVEN_PROJECTBASEDIR=$(cd "$(dirname "$0")" && pwd)', 'exec "$JAVA_HOME/bin/java" -classpath "$MAVEN_PROJECTBASEDIR/.mvn/wrapper/maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain "$@"'],
    'application.yml': (ws) => ['spring:', '  application:', `    name: ${ws.root}`, '  datasource:', '    url: jdbc:postgresql://localhost:5432/app', '    username: app', '  jpa:', '    hibernate:', '      ddl-auto: validate', 'server:', '  port: 8080'],
    'appsettings.json': () => ['{', '  "Logging": {', '    "LogLevel": {', '      "Default": "Information",', '      "Microsoft.AspNetCore": "Warning"', '    }', '  },', '  "ConnectionStrings": {', '    "Default": "Host=localhost;Database=app;Username=app"', '  },', '  "AllowedHosts": "*"', '}'],
    'pubspec.yaml': (ws, t) => [`name: ${ws.root}`, 'description: A new Flutter project.', 'publish_to: none', 'version: 1.0.0+1', '', 'environment:', "  sdk: '>=3.3.0 <4.0.0'", '', 'dependencies:', '  flutter:', '    sdk: flutter', ...(t.deps ?? []).map((d) => `  ${d}: ^${version(d)}`), '', 'flutter:', '  uses-material-design: true', '  assets:', '    - assets/images/'],
    'analysis_options.yaml': () => ['include: package:flutter_lints/flutter.yaml', '', 'linter:', '  rules:', '    prefer_const_constructors: true', '    avoid_print: false'],
    'CMakeLists.txt': (ws) => ['cmake_minimum_required(VERSION 3.20)', `project(${ws.root} LANGUAGES CXX)`, '', 'set(CMAKE_CXX_STANDARD 20)', 'set(CMAKE_CXX_STANDARD_REQUIRED ON)', '', 'file(GLOB_RECURSE SOURCES src/*.cpp)', `add_executable(${ws.root} \${SOURCES})`, `target_include_directories(${ws.root} PRIVATE include)`, '', 'enable_testing()', 'add_subdirectory(tests)'],
    Makefile: (ws, t) =>
      t.id === 'go'
        ? ['.PHONY: build run test lint', '', 'build:', `\tgo build -o bin/${ws.root} ./cmd/server`, '', 'run: build', `\t./bin/${ws.root}`, '', 'test:', '\tgo test ./...', '', 'lint:', '\tgolangci-lint run']
        : ['CC = arm-none-eabi-gcc', 'CFLAGS = -mcpu=cortex-m4 -mthumb -O2 -Wall -Iinclude', 'LDFLAGS = -Tlinker.ld -nostartfiles', '', 'SRC = $(wildcard src/*.c src/*/*.c)', 'OBJ = $(SRC:.c=.o)', '', `all: build/${ws.root}.elf`, '', `build/${ws.root}.elf: $(OBJ)`, '\t$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $^', '', 'clean:', '\trm -f $(OBJ) build/*.elf'],
    'linker.ld': () => ['MEMORY', '{', '  FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 512K', '  RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 128K', '}', '', 'SECTIONS', '{', '  .text : { *(.isr_vector) *(.text*) } > FLASH', '  .data : { *(.data*) } > RAM AT > FLASH', '  .bss  : { *(.bss*) } > RAM', '}'],
    'composer.json': (ws, t) => ['{', `    "name": "acme/${ws.root}",`, '    "type": "project",', '    "require": {', '        "php": "^8.2",', ...(t.deps ?? []).map((d, i, a) => `        "${d}": "^${version(d)}"${i < a.length - 1 ? ',' : ''}`), '    },', '    "autoload": {', '        "psr-4": { "App\\\\": "app/" }', '    }', '}'],
    artisan: () => ['#!/usr/bin/env php', '<?php', '', "define('LARAVEL_START', microtime(true));", '', "require __DIR__.'/vendor/autoload.php';", '', "$status = (require_once __DIR__.'/bootstrap/app.php')->handleCommand(new ArgvInput);", '', 'exit($status);'],
    Gemfile: (ws, t) => ['source "https://rubygems.org"', '', 'ruby "3.3.0"', '', ...(t.deps ?? []).map((d) => `gem "${d}", "~> ${version(d).split('.').slice(0, 2).join('.')}"`)],
    'Gemfile.lock': (ws, t) => ['GEM', '  remote: https://rubygems.org/', '  specs:', ...(t.deps ?? []).map((d) => `    ${d} (${version(d)})`), '', 'PLATFORMS', '  ruby', '', 'BUNDLED WITH', '   2.5.6'],
    Rakefile: () => ['require_relative "config/application"', '', 'Rails.application.load_tasks'],
    'manifest.json': () => ['{', '  "dependencies": {', '    "com.unity.inputsystem": "1.7.0",', '    "com.unity.textmeshpro": "3.0.6",', '    "com.unity.render-pipelines.universal": "14.0.9",', '    "com.unity.cinemachine": "2.9.7",', '    "com.unity.ugui": "1.0.0"', '  }', '}'],
    'ProjectVersion.txt': () => ['m_EditorVersion: 2022.3.21f1', 'm_EditorVersionWithRevision: 2022.3.21f1 (d00248457e15)'],
    'DefaultEngine.ini': () => ['[/Script/EngineSettings.GameMapsSettings]', 'GameDefaultMap=/Game/Maps/MainMenu.MainMenu', 'EditorStartupMap=/Game/Maps/Sandbox.Sandbox', '', '[/Script/Engine.RendererSettings]', 'r.DefaultFeature.AutoExposure=False', 'r.Lumen.HardwareRayTracing=True'],
    'DefaultGame.ini': (ws) => ['[/Script/EngineSettings.GeneralProjectSettings]', `ProjectName=${ws.root}`, 'CompanyName=Acme', 'ProjectVersion=0.3.0'],
    'AndroidManifest.xml': () => ['<?xml version="1.0" encoding="utf-8"?>', '<manifest xmlns:android="http://schemas.android.com/apk/res/android">', '    <uses-permission android:name="android.permission.INTERNET" />', '    <application', '        android:label="@string/app_name"', '        android:theme="@style/Theme.App">', '        <activity android:name=".MainActivity" android:exported="true">', '            <intent-filter>', '                <action android:name="android.intent.action.MAIN" />', '                <category android:name="android.intent.category.LAUNCHER" />', '            </intent-filter>', '        </activity>', '    </application>', '</manifest>'],
    'strings.xml': (ws) => ['<resources>', `    <string name="app_name">${ws.root}</string>`, '    <string name="action_settings">Settings</string>', '    <string name="retry">Retry</string>', '</resources>'],
    'build.gradle.kts': (ws) => ['plugins {', '    id("com.android.application")', '    kotlin("android")', '}', '', 'android {', '    namespace = "com.example.app"', '    compileSdk = 34', '    defaultConfig {', '        minSdk = 26', '        targetSdk = 34', '    }', '}', '', 'dependencies {', '    implementation("androidx.core:core-ktx:1.13.1")', '    implementation("androidx.compose.material3:material3:1.2.1")', '}'],
    'settings.gradle.kts': (ws) => ['pluginManagement {', '    repositories { google(); mavenCentral() }', '}', `rootProject.name = "${ws.root}"`, 'include(":app")'],
    'gradle.properties': () => ['org.gradle.jvmargs=-Xmx2048m', 'android.useAndroidX=true', 'kotlin.code.style=official'],
    'build.gradle': () => ['plugins {', '    id "com.android.application"', '    id "dev.flutter.flutter-gradle-plugin"', '}', '', 'android {', '    namespace "com.example.app"', '    compileSdk 34', '}'],
    'Info.plist': (ws) => ['<?xml version="1.0" encoding="UTF-8"?>', '<plist version="1.0">', '<dict>', '    <key>CFBundleName</key>', `    <string>${ws.root}</string>`, '    <key>CFBundleShortVersionString</key>', '    <string>1.0</string>', '    <key>UILaunchStoryboardName</key>', '    <string>LaunchScreen</string>', '</dict>', '</plist>'],
    Dockerfile: (ws, t) => ({ go: ['FROM golang:1.22 AS build', 'WORKDIR /src', 'COPY . .', 'RUN go build -o /app ./cmd/server', '', 'FROM gcr.io/distroless/base', 'COPY --from=build /app /app', 'EXPOSE 8080', 'ENTRYPOINT ["/app"]'], django: ['FROM python:3.12-slim', 'WORKDIR /app', 'COPY requirements.txt .', 'RUN pip install -r requirements.txt', 'COPY . .', 'CMD ["gunicorn", "config.wsgi", "-b", "0.0.0.0:8000"]'] })[t.id] ?? ['FROM node:20-alpine', 'WORKDIR /app', 'COPY package*.json ./', 'RUN npm ci', 'COPY . .', 'RUN npm run build', 'EXPOSE 3000', 'CMD ["node", "dist/index.js"]'],
    '.env.example': () => ['APP_ENV=local', 'APP_DEBUG=true', 'DATABASE_URL=postgres://app:app@localhost:5432/app', 'REDIS_URL=redis://localhost:6379', 'JWT_SECRET=change-me'],
    'launch.json': (ws, t) => {
      const type = { py: ['debugpy', 'Python Debugger: FastAPI', '"module": "uvicorn",\n      "args": ["src.main:app", "--reload"]'], ts: ['node', 'Launch Program', '"program": "${workspaceFolder}/src/index.ts"'], tsx: ['chrome', 'Launch Chrome', '"url": "http://localhost:5173"'], java: ['java', 'Spring Boot-DemoApplication', '"mainClass": "com.example.demo.DemoApplication"'], go: ['go', 'Launch Package', '"program": "${workspaceFolder}/cmd/server"'], cs: ['coreclr', '.NET Core Launch (web)', '"program": "${workspaceFolder}/bin/Debug/net8.0/App.dll"'], dart: ['dart', 'Flutter', '"program": "lib/main.dart"'], rs: ['lldb', 'Debug executable', '"cargo": { "args": ["build"] }'], cpp: ['cppdbg', '(gdb) Launch', '"program": "${workspaceFolder}/build/app"'], c: ['cortex-debug', 'Cortex Debug', '"executable": "build/firmware.elf"'], kt: ['kotlin', 'Kotlin Launch', '"mainClass": "MainKt"'], swift: ['swift', 'Debug App', '"program": "${workspaceFolder}/.build/debug/App"'], php: ['php', 'Listen for Xdebug', '"port": 9003'], rb: ['rdbg', 'Debug Rails', '"script": "bin/rails server"'], lua: ['lua-local', 'Debug Love', '"program": { "command": "love" }'] }[t.chat] ?? ['node', 'Launch Program', '"program": "${workspaceFolder}/index.js"']
      return ['{', '  "version": "0.2.0",', '  "configurations": [', '    {', `      "type": "${type[0]}",`, '      "request": "launch",', `      "name": "${type[1]}",`, ...type[2].split('\n').map((l, i, all) => (l.startsWith('      ') ? l : '      ' + l) + (i === all.length - 1 ? '' : '')), '    }', '  ]', '}']
    },
    'docker-compose.yml': (ws) => ['services:', '  app:', '    build: .', '    env_file: .env', '    ports:', '      - "8000:8000"', '    depends_on:', '      - db', '      - redis', '  db:', '    image: postgres:16', '    environment:', `      POSTGRES_DB: ${ws.root.replace(/\W/g, '_')}`, '      POSTGRES_PASSWORD: postgres', '    volumes:', '      - pgdata:/var/lib/postgresql/data', '  redis:', '    image: redis:7', '', 'volumes:', '  pgdata:'],
    'ci.yml': () => ['name: CI', '', 'on:', '  push:', '    branches: [main]', '  pull_request:', '', 'jobs:', '  test:', '    runs-on: ubuntu-latest', '    steps:', '      - uses: actions/checkout@v4', '      - name: Install', '        run: make install', '      - name: Lint', '        run: make lint', '      - name: Test', '        run: make test'],
    LICENSE: () => ['MIT License', '', `Copyright (c) ${new Date().getFullYear()} Acme`, '', 'Permission is hereby granted, free of charge, to any person obtaining a copy', 'of this software and associated documentation files (the "Software"), to deal', 'in the Software without restriction, including without limitation the rights', 'to use, copy, modify, merge, publish, distribute, sublicense, and/or sell', 'copies of the Software.'],
    '.editorconfig': () => ['root = true', '', '[*]', 'charset = utf-8', 'end_of_line = lf', 'indent_style = space', 'indent_size = 2', 'insert_final_newline = true', 'trim_trailing_whitespace = true', '', '[*.{py,cs,java,kt}]', 'indent_size = 4'],
    '.prettierrc': () => ['{', '  "semi": false,', '  "singleQuote": true,', '  "printWidth": 120,', '  "trailingComma": "all"', '}'],
    'eslint.config.js': () => ["import js from '@eslint/js'", "import tseslint from 'typescript-eslint'", '', 'export default tseslint.config(', '  js.configs.recommended,', '  ...tseslint.configs.recommended,', "  { ignores: ['dist', 'coverage'] },", ')'],
    'eslint.config.mjs': () => ["import next from 'eslint-config-next'", '', 'export default [...next, { rules: { \'react/no-unescaped-entities\': \'off\' } }]'],
    'alembic.ini': () => ['[alembic]', 'script_location = alembic', 'sqlalchemy.url = postgresql://app:app@localhost/app', '', '[loggers]', 'keys = root,sqlalchemy,alembic'],
    'requirements-dev.txt': () => ['-r requirements.txt', 'pytest-cov==5.0.0', 'ruff==0.6.9', 'mypy==1.11.2', 'pre-commit==3.8.0'],
    'pytest.ini': () => ['[pytest]', 'DJANGO_SETTINGS_MODULE = config.settings.local', 'python_files = tests.py test_*.py', 'addopts = -ra --reuse-db'],
    '.golangci.yml': () => ['run:', '  timeout: 5m', 'linters:', '  enable:', '    - govet', '    - errcheck', '    - staticcheck', '    - revive', '    - gofumpt'],
    'openapi.yaml': (ws) => ['openapi: 3.0.3', 'info:', `  title: ${ws.root}`, '  version: 1.0.0', 'paths:', '  /health:', '    get:', '      responses:', '        "200":', '          description: OK', '  /users/{id}:', '    get:', '      parameters:', '        - name: id', '          in: path', '          required: true', '          schema:', '            type: integer'],
    'launchSettings.json': () => ['{', '  "profiles": {', '    "http": {', '      "commandName": "Project",', '      "launchBrowser": true,', '      "launchUrl": "swagger",', '      "applicationUrl": "http://localhost:5080",', '      "environmentVariables": {', '        "ASPNETCORE_ENVIRONMENT": "Development"', '      }', '    }', '  }', '}'],
    'Directory.Build.props': () => ['<Project>', '  <PropertyGroup>', '    <TargetFramework>net8.0</TargetFramework>', '    <Nullable>enable</Nullable>', '    <ImplicitUsings>enable</ImplicitUsings>', '    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>', '  </PropertyGroup>', '</Project>'],
    'tailwind.config.ts': () => ["import type { Config } from 'tailwindcss'", '', 'export default {', "  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],", '  theme: { extend: {} },', '  plugins: [],', '} satisfies Config'],
    'postcss.config.mjs': () => ['export default {', '  plugins: { tailwindcss: {}, autoprefixer: {} },', '}'],
    'robots.txt': () => ['User-agent: *', 'Allow: /'],
    '.gitattributes': () => ['* text=auto', '*.unity merge=unityyamlmerge eol=lf', '*.prefab merge=unityyamlmerge eol=lf', '*.png filter=lfs diff=lfs merge=lfs -text', '*.fbx filter=lfs diff=lfs merge=lfs -text'],
    'packages-lock.json': () => ['{', '  "dependencies": {', '    "com.unity.inputsystem": {', '      "version": "1.7.0",', '      "depth": 0,', '      "source": "registry"', '    }', '  }', '}'],
    'DefaultInput.ini': () => ['[/Script/Engine.InputSettings]', 'DefaultPlayerInputClass=/Script/EnhancedInput.EnhancedPlayerInput', 'DefaultInputComponentClass=/Script/EnhancedInput.EnhancedInputComponent'],
    'l10n.yaml': () => ['arb-dir: lib/l10n', 'template-arb-file: app_en.arb', 'output-localization-file: app_localizations.dart'],
    'app_en.arb': () => ['{', '  "@@locale": "en",', '  "appTitle": "App",', '  "signIn": "Sign in"', '}'],
    'app_ko.arb': () => ['{', '  "@@locale": "ko",', '  "appTitle": "App",', '  "signIn": "Sign in"', '}'],
    'pubspec.lock': (ws, t) => ['packages:', ...(t.deps ?? []).flatMap((d) => [`  ${d}:`, '    dependency: "direct main"', `    version: "${version(d)}"`]), 'sdks:', '  dart: ">=3.3.0 <4.0.0"'],
    Podfile: () => ["platform :ios, '13.0'", '', "target 'Runner' do", '  use_frameworks!', '  flutter_install_all_ios_pods File.dirname(File.realpath(__FILE__))', 'end'],
    'libs.versions.toml': () => ['[versions]', 'agp = "8.5.2"', 'kotlin = "2.0.20"', 'composeBom = "2024.09.00"', '', '[libraries]', 'androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version = "1.13.1" }', '', '[plugins]', 'android-application = { id = "com.android.application", version.ref = "agp" }'],
    'colors.xml': () => ['<?xml version="1.0" encoding="utf-8"?>', '<resources>', '    <color name="purple_500">#FF6200EE</color>', '    <color name="black">#FF000000</color>', '    <color name="white">#FFFFFFFF</color>', '</resources>'],
    'themes.xml': () => ['<resources>', '    <style name="Theme.App" parent="Theme.Material3.DayNight.NoActionBar" />', '</resources>'],
    'proguard-rules.pro': () => ['-keepattributes Signature', '-keep class com.example.app.data.** { *; }', '-dontwarn okhttp3.**'],
    'Package.swift': (ws) => ['// swift-tools-version:5.9', 'import PackageDescription', '', 'let package = Package(', `    name: "${ws.root}",`, '    platforms: [.iOS(.v17)],', '    dependencies: [', '        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.9.0"),', '    ]', ')'],
    'Localizable.strings': () => ['"app.title" = "App";', '"sign.in" = "Sign in";', '"settings" = "Settings";'],
    '.clang-format': () => ['BasedOnStyle: LLVM', 'IndentWidth: 4', 'ColumnLimit: 120', 'AllowShortFunctionsOnASingleLine: Inline'],
    'CMakePresets.json': () => ['{', '  "version": 6,', '  "configurePresets": [', '    { "name": "debug", "binaryDir": "build/debug", "cacheVariables": { "CMAKE_BUILD_TYPE": "Debug" } },', '    { "name": "release", "binaryDir": "build/release", "cacheVariables": { "CMAKE_BUILD_TYPE": "Release" } }', '  ]', '}'],
    'conanfile.txt': () => ['[requires]', 'fmt/10.2.1', 'spdlog/1.13.0', 'glm/0.9.9.8', '', '[generators]', 'CMakeDeps', 'CMakeToolchain'],
    'rustfmt.toml': () => ['edition = "2021"', 'max_width = 120', 'imports_granularity = "Crate"'],
    'build.rs': () => ['fn main() {', '    println!("cargo:rerun-if-changed=build.rs");', '}'],
    '.ruby-version': () => ['3.3.0'],
    'config.ru': () => ['require_relative "config/environment"', '', 'run Rails.application', 'Rails.application.load_server'],
    Procfile: () => ['web: bundle exec puma -C config/puma.rb', 'worker: bundle exec sidekiq'],
    'database.yml': (ws) => ['default: &default', '  adapter: postgresql', '  encoding: unicode', '  pool: 5', '', 'development:', '  <<: *default', `  database: ${ws.root.replace(/\W/g, '_')}_development`],
    'phpunit.xml': () => ['<?xml version="1.0" encoding="UTF-8"?>', '<phpunit bootstrap="vendor/autoload.php" colors="true">', '    <testsuites>', '        <testsuite name="Feature">', '            <directory>tests/Feature</directory>', '        </testsuite>', '    </testsuites>', '</phpunit>'],
    'composer.lock': () => ['{', '    "_readme": ["This file locks the dependencies of your project to a known state"],', '    "content-hash": "3f1c2e9a7d0b4c6e8a1f5d2b9c7e0a4d",', '    "packages": []', '}'],
    'vite.config.js': () => ["import { defineConfig } from 'vite'", "import laravel from 'laravel-vite-plugin'", '', 'export default defineConfig({', "  plugins: [laravel({ input: ['resources/css/app.css', 'resources/js/app.js'], refresh: true })],", '})'],
    '.env': () => ['VITE_API_URL=http://localhost:8000'],
    '.env.local': () => ['DATABASE_URL=postgres://app:app@localhost:5432/app', 'NEXTAUTH_SECRET=change-me'],
    gradlew: () => ['#!/bin/sh', '# Gradle start up script for UN*X', 'APP_HOME=$(cd "$(dirname "$0")" && pwd -P)', 'exec java -classpath "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain "$@"'],
    'mvnw.cmd': () => ['@REM Apache Maven Wrapper startup batch script', '@echo off', 'set MAVEN_PROJECTBASEDIR=%~dp0', '"%JAVA_HOME%\\bin\\java.exe" -classpath "%MAVEN_PROJECTBASEDIR%.mvn\\wrapper\\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*'],
    'schema.prisma': () => ['generator client {', '  provider = "prisma-client-js"', '}', '', 'datasource db {', '  provider = "postgresql"', '  url      = env("DATABASE_URL")', '}', '', 'model User {', '  id        Int      @id @default(autoincrement())', '  email     String   @unique', '  createdAt DateTime @default(now())', '}'],
  }

  const BY_TYPE = {
    json: (ws) => ['{', `  "name": "${ws.root}",`, '  "debug": false,', '  "timeout": 30,', '  "retries": 3', '}'],
    yaml: (ws, t, stem, p) =>
      /\.(unity|prefab|asset|mat|meta|anim|controller|mixer|physicmaterial)$/i.test(p)
        ? ['%YAML 1.1', '%TAG !u! tag:unity3d.com,2011:', '--- !u!1 &1', 'GameObject:', '  m_ObjectHideFlags: 0', `  m_Name: ${stem}`, '  m_IsActive: 1']
        : ['version: 1', 'settings:', '  debug: false', '  timeout: 30'],
    xml: () => ['<?xml version="1.0" encoding="utf-8"?>', '<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"', '    android:layout_width="match_parent"', '    android:layout_height="match_parent"', '    android:orientation="vertical">', '    <TextView', '        android:id="@+id/title"', '        android:layout_width="wrap_content"', '        android:layout_height="wrap_content" />', '</LinearLayout>'],
    html: (ws, t, stem, p) =>
      p.endsWith('.vue')
        ? ['<script setup lang="ts">', "import { ref } from 'vue'", '', 'const count = ref(0)', '</script>', '', '<template>', `  <section class="${stem.toLowerCase()}">`, '    <button @click="count++">{{ count }}</button>', '  </section>', '</template>']
        : ['<!doctype html>', '<html lang="en">', '  <head>', '    <meta charset="UTF-8" />', `    <title>${ws.root}</title>`, '  </head>', '  <body>', '    <div id="root"></div>', '    <script type="module" src="/src/main.tsx"></script>', '  </body>', '</html>'],
    css: () => [':root {', '  --primary: #4f46e5;', '  --radius: 8px;', '}', '', 'body {', '  margin: 0;', '  font-family: system-ui, sans-serif;', '}', '', '.container {', '  max-width: 1200px;', '  margin: 0 auto;', '  padding: 0 16px;', '}'],
    toml: (ws) => ['[package]', `name = "${ws.root}"`, 'version = "0.1.0"'],
    ini: () => ['[settings]', 'debug=false', 'timeout=30'],
    sql: () => ['CREATE TABLE users (', '  id SERIAL PRIMARY KEY,', '  email TEXT NOT NULL UNIQUE,', '  created_at TIMESTAMPTZ NOT NULL DEFAULT now()', ');', '', 'CREATE INDEX users_email_idx ON users (email);'],
    markdown: (ws, t, stem) => [`# ${stem}`, '', 'TODO'],
    groovy: () => ['plugins {', "    id 'java'", '}'],
    shell: () => ['#!/usr/bin/env bash', 'set -euo pipefail', '', 'echo "done"'],
  }

  const SPECIAL_CODE = {
    '__init__.py': () => [''],
    'mod.rs': () => ['pub mod build;', 'pub mod init;', 'pub mod status;'],
    'MyGame.Build.cs': () => ['using UnrealBuildTool;', '', 'public class MyGame : ModuleRules', '{', '    public MyGame(ReadOnlyTargetRules Target) : base(Target)', '    {', '        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;', '        PublicDependencyModuleNames.AddRange(new[] { "Core", "CoreUObject", "Engine", "InputCore", "EnhancedInput" });', '    }', '}'],
  }

  const testFile = (stem) => /^test_|_test$|Tests?$|\.test$|_spec$/.test(stem)

  const BINARY = /\.(png|jpe?g|gif|ico|webp|ogg|wav|mp3|fbx|obj|blend|ttf|otf|dll|jar|uasset|umap|enc|so|a|bin|elf)$/i
  const binary = (p) => BINARY.test(p)

  const content = (ws, p) => {
    const t = get(ws.template)
    const name = base(p)
    const stem = stemOf(p)
    if (binary(p)) return null
    if (NAMED[name]) return NAMED[name](ws, t)
    const L = LANGS.of(p)
    if (L.code) {
      if (SPECIAL_CODE[name]) return SPECIAL_CODE[name]()
      if (L.id === 'python' && testFile(stem)) {
        const names = L.names
        const pick = (n) => Array.from({ length: n }, (_, i) => names[(CAMO.hash(p) + i * 7) % names.length])
        return ['import pytest', '', `from src.handlers import ${pick(3).join(', ')}`, '', ...pick(3).flatMap((f) => ['', `def test_${f}_handles_empty_input():`, `    assert ${f}([]) in (None, [], 0)`, '']), '', '@pytest.mark.parametrize("value", [None, "", " "])', 'def test_rejects_blank(value):', '    with pytest.raises(ValueError):', `        ${pick(1)[0]}(value)`]
      }
      const cls = styled(stem, 'pascal') || 'Main'
      const lines = CAMO.filler(p, L.id, 4 + (CAMO.hash(p) % 4), cls)
      if (t.id === 'unity' && L.id === 'csharp' && p.startsWith('Assets/'))
        return ['using UnityEngine;', ...lines]
          .filter((l, i, all) => l !== 'namespace App;' && !(l === '' && all[i - 1] === 'namespace App;'))
          .map((l) => (l === `public class ${cls}` ? `public class ${cls} : MonoBehaviour` : l))
      return lines
    }
    const make = BY_TYPE[L.id]
    return make ? make(ws, t, stem, p) : ['']
  }

  const files = (id) => {
    const t = get(id)
    const folders = new Set()
    const list = []
    const addParents = (p) => {
      const parts = p.split('/')
      for (let i = 1; i < parts.length; i++) folders.add(parts.slice(0, i).join('/'))
    }
    for (const entry of t.files) {
      const p = entry.replace(/\/$/, '')
      addParents(p)
      entry.endsWith('/') ? folders.add(p) : list.push(p)
    }
    if (t.inbox) {
      addParents(t.inbox)
      folders.add(t.inbox)
    }
    if (!list.includes('README.md')) list.unshift('README.md')
    return { folders: [...folders], files: list }
  }

  return { LIST, get, files, content, styled, stemOf, binary }
})()

if (typeof module !== 'undefined') module.exports = templates

if (typeof require !== 'undefined' && require.main === module) {
  const assert = require('assert')
  const LANGS = require('./langs')
  assert.strictEqual(templates.styled('user_card', 'pascal'), 'UserCard')
  assert.strictEqual(templates.styled('PlayerController', 'snake'), 'player_controller')
  assert.strictEqual(templates.styled('friend-api', 'camel'), 'friendApi')
  assert.strictEqual(templates.get('nope').id, 'python-backend')
  const ids = new Set()
  for (const t of templates.LIST) {
    assert(!ids.has(t.id), 'unique id ' + t.id)
    ids.add(t.id)
    assert(LANGS.of('x.' + t.chat).code, `${t.id}: chats use a code language`)
    assert(t.names.length >= 10, `${t.id}: enough names`)
    const { folders, files } = templates.files(t.id)
    assert(folders.includes(t.inbox), `${t.id}: inbox exists`)
    assert(files.includes('README.md'))
    assert.strictEqual(new Set(files).size, files.length)
    const ws = { template: t.id, root: t.root }
    for (const f of files) {
      const lines = templates.content(ws, f)
      if (templates.binary(f)) {
        assert.strictEqual(lines, null, `${t.id}: ${f} is binary`)
        continue
      }
      assert(Array.isArray(lines) && lines.every((l) => typeof l === 'string' && !l.includes('\n') && !l.includes('$f')), `${t.id}: ${f}`)
    }
  }
  console.log('ok')
}
