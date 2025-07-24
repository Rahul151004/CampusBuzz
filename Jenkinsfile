pipeline {
  agent any

  environment {
    MONGO_URI = credentials('mongo-url') 
    JWT_SECRET = credentials('jwt-secret-id')
    IMAGE_NAME = 'rbhat04/campusbuzz-app:latest'
    CONTAINER_NAME = 'campusbuzz'
    PORT = '3000'
  }

  stages {
    stage('Clone Repo') {
      steps {
        git branch: 'aws-deployment', url: 'https://github.com/Rahul151004/CampusBuzz.git'
      }
    }

    stage('Build Docker Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
          sh '''
            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

            docker build -t $IMAGE_NAME .

            docker push $IMAGE_NAME

            docker logout
          '''
        }
      }
    }

    stage('Run Container') {
      steps {
        sh '''
          echo Stopping any existing container...
          docker stop $CONTAINER_NAME || true
          docker rm $CONTAINER_NAME || true

          echo Running new container...
          docker run -d \
            --name $CONTAINER_NAME \
            -p $PORT:$PORT \
            -e MONGO_URI=$MONGO_URI \
            -e JWT_SECRET=$JWT_SECRET \
            $IMAGE_NAME
        '''
      }
    }
  }

  post {
    success {
      echo "✅ CampusBuzz deployed successfully to port $PORT!"
    }
    failure {
      echo "❌ Build or deployment failed."
    }
  }
}
