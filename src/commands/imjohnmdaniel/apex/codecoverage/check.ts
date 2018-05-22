import {flags} from '@oclif/command';
import {join} from 'path';
import {SfdxCommand, core} from '@salesforce/command';
import * as _ from 'lodash';

core.Messages.importMessagesDirectory(join(__dirname, '..', '..', '..'));
const messages = core.Messages.loadMessages('sfdx-cli-custom-expansion', 'org');

export default class Org extends SfdxCommand {

  public static description = messages.getMessage('commandDescription');

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    testcoveragefile: flags.string({char: 'f', required: true, description: messages.getMessage('nameFlagDescription')})
  };

  // Comment this out if your command does not require an org username
  // protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  // protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = true;

  public async run(): Promise<any> { // tslint:disable-line:no-any

    const projectJson = await this.project.retrieveSfdxProjectJson();

    const converageRequirement = _.get( projectJson.get('plugins'), 'imjohnmdaniel.coverageRequirement') || 70;
    // When reading a file with core library, it is an async operation and thus you need the "await" command added.
    const coverages = await core.SfdxUtil.readJSON(this.flags.testcoveragefile);

    _.forEach(coverages, (coverage) => {
        if (coverage['coveredPercent'] < converageRequirement) {
          throw new core.SfdxError(`The coverage for ${coverage['name']} is less than ${converageRequirement}`);
        }
    });

    this.ux.log( 'Success');
    // Return an object to be displayed with --json
    return {  };
  }
}
