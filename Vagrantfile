# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|

  config.vm.define "lanodized"
  config.vm.box = "ubuntu/xenial64"
  config.vm.hostname = "lanodized"

  # PostgreSQL
  config.vm.network "forwarded_port", guest: 5432, host: 15432, host_ip: "127.0.0.1"

  config.vm.synced_folder ".", "/opt/lanodized"

  config.vm.provider "virtualbox" do |vb|
    vb.name = "lanodized"
    vb.memory = "1024"
    vb.cpus = 2
  end

  config.vm.provision "file", source: "bin/aliases.sh", destination: ".bash_aliases"

  config.vm.provision "shell", name: "environment",
    path: "bin/provision/env.sh"
  config.vm.provision "shell", name: "utilities",
    path: "bin/provision/utils.sh"
  config.vm.provision "shell", name: "PostgreSQL",
    path: "bin/provision/postgres.sh"
  config.vm.provision "shell", name: "node.js",
    path: "bin/provision/node.sh"
  config.vm.provision "shell", name: "bootstrapping",
    path: "bin/provision/bootstrap.sh",
    privileged: false
  config.vm.provision "shell", name: "startup",
    path: "bin/startup.sh",
    privileged: false,
    run: "always"

end
