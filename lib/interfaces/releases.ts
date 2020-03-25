import * as Octokit from '@octokit/rest'

export interface ILatestRelease extends Octokit.ReposGetReleaseResponse {}

export interface IReleasesOutput {
  latestRelease: ILatestRelease | null
  latestReleaseFetchedAt: Date
}
