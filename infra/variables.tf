variable "instance_type" {
    description = "Instance type of EC2 Instance"
    default = "t2.micro"
}

variable "aws_region" {
    description = "Region of AWS where the EC2 instance will be provisioned"
    default = "ap-south-1"
}

variable "githun_repo_url" {
    description = "Remote URL of GithHub Repository from where project will be cloned and deployed"
    default = "https://github.com/Rahul151004/CampusBuzz.git"
}

variable "key_name" {
    default = "campusbuzz"
    description = "Name of existing AWS key pair"
}