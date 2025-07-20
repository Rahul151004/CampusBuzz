data "aws_vpc" "default" {
    default = true
}

data "aws_ami" "ubuntu" {
    most_recent = true
    owners = ["099720109477"] # Canonical (Ubuntu)

    filter {
        name = "name" # filter using name of ubuntu
        values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
    }
}

resource "aws_security_group" "campusbuzz_sg" {
    name = "campusbuzz_sg"
    description = "Allow SSH and app port"
    vpc_id = data.aws_vpc.default.id


    ingress {
        description = "SSH port"
        from_port = 22
        to_port = 22
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "App access on port 3000"
        from_port = 3000
        to_port = 3000
        protocol =  "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        from_port = 0
        to_port = 0
        protocol = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        from_port = 8080
        to_port = 8080
        protocol = "tcp"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

resource "aws_instance" "campusbuzz_instance" {
    ami = data.aws_ami.ubuntu.id
    instance_type = var.instance_type
    vpc_security_group_ids = [ aws_security_group.campusbuzz_sg.id ]
    key_name = var.key_name

    tags = {
        Name = "CampusBuzz-Server"
    }
}