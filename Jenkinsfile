pipeline {
  agent any

  tools {
    nodejs 'node20'
  }

  environment {
    MONGO_URI = credentials('mongo-url') 
    JWT_SECRET = credentials('jwt-secret-id')
  }

  stages {
    stage('Clone Repo') {
      steps {
        git url: 'https://github.com/Rahul151004/CampusBuzz.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        bat 'npm install'
      }
    }

    stage('Start Server Temporarily') {
      steps {
        bat '''
        @echo off
        echo Starting server.js in background...
        start "" /B cmd /c "node server.js > server-log.txt 2>&1"
        timeout /T 30 /NOBREAK
        echo Killing Node process...
        taskkill /F /IM node.exe > nul 2>&1
      '''
      }
    }

    stage('Archive Frontend (Optional)') {
      steps {
        archiveArtifacts artifacts: 'public/**', allowEmptyArchive: true
      }
    }
  }
}
