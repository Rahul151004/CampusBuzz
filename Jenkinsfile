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
        echo Starting node server in background...
        start "" cmd /c "node server.js > server-log.txt 2>&1"
        
        REM Wait for ~30 seconds (30 pings = ~30s)
        ping -n 30 127.0.0.1 > nul

        echo Killing Node processes...
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
