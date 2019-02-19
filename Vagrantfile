# SilverStripe Team Vagrant config.
# Catalyst I.T. SilverStripe Team 2018.
#
# You will need Catalyst's "devtools" installed on your development box.
# See: http://devtools-docs.wgtn.cat-it.co.nz/
#
# Note: Postgres is devtools' default RDBMS. Uncomment the mysql section below for MySQL.
# TODO: Enable mail.
project_name="SDLT"
remove_public=0
wr="306952"
rdbms="mysql"
php_ver='7.2'
  
if php_ver == 'dummy'
  puts 'Project has not been initialised!'
  exit
end

Vagrant.configure('2') do |config|
  config.catalyst.platform = 'ubuntu-16.04'
  config.catalyst.working_directory = '/vagrant'
  config.hostmanager.enabled = true
  config.hostmanager.manage_host = true
  config.ssh.insert_key = false
  config.ssh.forward_agent = true
  # This is why the container has the same name as a previous project..
  config.vm.define project_name
  config.vm.provision 'catalyst' do |cat|
    cat.project_type = 'silverstripe4'
    cat.project_name = project_name
    # http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant/catalyst-provisioner.html?highlight=mail#composer
    cat.tools << 'composer'
    # http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant/catalyst-provisioner.html?highlight=mail#git
    cat.tools << 'git'
    # http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant/catalyst-provisioner.html?highlight=mail#fakesmtp
    cat.tools << 'fakesmtp'
    # http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant/catalyst-provisioner.html?highlight=mail#node-js
    cat.tools << 'nodejs'
    cat.hiera_data = {
      'devenv::tools::nodejs::version' => '8.x'
    }
    # http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant/catalyst-provisioner.html?highlight=mail#xdebug
    # This setting does not apply to custom PHP versions.
    cat.tools << 'xdebug'
    if rdbms == 'mysql'
      # http://devtools-docs.wgtn.cat-it.co.nz/catalyst-vagrant/catalyst-provisioner.html?highlight=mail#mysql
      cat.services << 'mysql'
    end
  end

  config.vm.provision 'shell' do |s|
    s.path = 'scripts/provision.sh'
    s.args = [project_name, remove_public, wr, rdbms, php_ver]
  end

  config.vm.provider 'lxd' do |lxd|
    lxd.name = project_name
  end

end
