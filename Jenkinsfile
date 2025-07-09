pipeline {
  agent any

  tools {
    nodejs 'node20'
  }

  environment {
    MONGO_URI = credentials('mongo-url') 
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

    stage('Start Server') {
      steps {
        bat 'node server.js'
      }
    }

    stage('Archive Frontend (Optional)') {
      steps {
        archiveArtifacts artifacts: 'public/**', allowEmptyArchive: true
      }
    }
  }
}
