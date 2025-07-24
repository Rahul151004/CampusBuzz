pipeline {
  agent any

  environment {
    MONGO_URI = credentials('mongo-url') 
    JWT_SECRET = credentials('jwt-secret-id')
    IMAGE_NAME = 'rbhat04/campusbuzz-app:latest'
    CONTAINER_NAME = 'campusbuzz'
    PORT = '3000'
    NODE_PORT = '30010'
  }

  stages {
    stage('Clone Repo') {
      steps {
        git url: 'https://github.com/Rahul151004/CampusBuzz.git'
      }
    }

    stage('Build and Push Docker Image') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
          bat """
            echo Logging into Docker Hub...
            echo %DOCKER_PASSWORD% | docker login -u %DOCKER_USERNAME% --password-stdin

            echo Building Docker image...
            docker build -t %IMAGE_NAME% .

            echo Pushing image to Docker Hub...
            docker push %IMAGE_NAME%

            echo Logging out...
            docker logout
          """
        }
      }
    }

    // stage('Run Container') {
    //   steps {
    //     bat '''
    //       echo Stopping any existing container...
    //       docker stop %CONTAINER_NAME%
    //       docker rm %CONTAINER_NAME%
    
    //       echo Running new container...
    //       docker run -d ^
    //         --name %CONTAINER_NAME% ^
    //         -p %PORT%:%PORT% ^
    //         -e "MONGO_URI=%MONGO_URI%" ^
    //         -e "JWT_SECRET=%JWT_SECRET%" ^
    //         %IMAGE_NAME%
    //     '''
    //   }
    // }
    
    stage('Deploy to K8s'){
        steps{
            withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                bat '''
                   echo Applying configMap...
                   kubectl apply -f configmap.yaml
                   
                   echo Applying Deployment and Service...
                   kubectl apply -f deployment.yaml
                   kubectl apply -f service.yaml
                   '''
            }
        }
    }
  }

  post {
    success {
      echo "✅ CampusBuzz deployed successfully to port %NODE_PORT%!"
    }
    failure {
      echo "❌ Build or deployment failed."
    }
  }
}