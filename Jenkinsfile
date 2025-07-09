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
        start /B node server.js
        timeout /T 30
        taskkill /F /IM node.exe
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
