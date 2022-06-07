@Library('global-jenkins-library@2.0.0') _

appName = 'generic-oracle-dapp'

buildSimpleDocker_v3(
        buildInfo : getBuildInfo(),
        dockerfileDir: './docker',
        dockerImageRepositoryName: appName,
        visibility: 'iex.ec')

sconeBuildAllTee(
        nativeImage: nativeImage,
        imageRegistry: 'docker-regis.iex.ec',
        imageName: appName,
        imageTag: buildInfo.imageTag,
        sconifyArgsPath: './docker/sconify.args',
        sconifyVersion: '5.3.15')
