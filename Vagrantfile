# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.define "lanodized"
  config.vm.box = "ubuntu/xenial64"

  config.vm.network "forwarded_port", guest: 5432, host: 15432, host_ip: "127.0.0.1"

  config.vm.synced_folder ".", "/opt/lanodized"

  config.vm.provider "virtualbox" do |vb|
    vb.name = "lanodized"
    vb.memory = "1024"
    vb.cpus = 2
  end

  config.vm.provision "shell", path: "bin/provision/postgres.sh"
  config.vm.provision "shell", path: "bin/provision/node.sh"
  config.vm.provision "shell", privileged: false, path: "bin/provision/bootstrap.sh"

end
