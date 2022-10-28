@Library('global-jenkins-library@2.0.0') _

docker.image('node:16-alpine').inside {
    stage('Test') {
        checkout scm
        sh '''
        npm ci
        npm run ci-test
        '''
        archiveArtifacts artifacts: 'coverage/'
    }
}

appName = 'generic-oracle-dapp'
buildInfo = getBuildInfo()

buildSimpleDocker_v3(
        buildInfo : buildInfo,
        dockerfileDir: './docker',
        dockerImageRepositoryName: appName,
        visibility: 'iex.ec')

sconeBuildAllTee(
        imageRegistry: 'docker-regis.iex.ec',
        imageName: appName,
        imageTag: buildInfo.imageTag,
        sconifyArgsPath: './docker/sconify.args',
        sconifyVersion: '5.3.15')
