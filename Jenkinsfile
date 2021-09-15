// Readme @ http://gitlab.iex.ec:30000/iexec/jenkins-library
@Library('jenkins-library@1.0.4') _

def nativeImage = buildSimpleDocker_v2(dockerfileDir: './docker', buildContext: '.',
        dockerImageRepositoryName: 'generic-oracle-dapp', imageprivacy: 'public')
sconeBuildAllTee(nativeImage: nativeImage, targetImageRepositoryName: 'generic-oracle-dapp',
        sconifyArgsPath: './docker/sconify.args')