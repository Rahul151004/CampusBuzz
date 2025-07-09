pipeline {
  agent any

  environment {
    // Update this to match the name in Jenkins Global Tools config
    NODEJS_HOME = tool name: 'node20', type: 'NodeJSInstallation'
    PATH = "${NODEJS_HOME}/bin:${env.PATH}"
  }

  stages {
    stage('Clone') {
      steps {
        git url: 'https://github.com/Rahul151004/CampusBuzz.git'
      }
    }

    stage('Install Frontend') {
      steps {
        dir('client') {
          bat 'npm install'
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('client') {
          bat 'npm run build'
        }
      }
    }

    stage('Install Backend') {
      steps {
        dir('server') {
          bat 'npm install'
        }
      }
    }

    stage('Lint/Test Backend') {
      steps {
        dir('server') {
          bat 'echo "No tests defined yet"'
        }
      }
    }

    stage('Archive Frontend Build') {
      steps {
        archiveArtifacts artifacts: 'client/build/**', allowEmptyArchive: true
      }
    }
  }
}
