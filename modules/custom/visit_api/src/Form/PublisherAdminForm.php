<?php
/**
 * @file
 * Contains \Drupal\visit_api\Form\PublisherAdminForm.
 */

namespace Drupal\visit_api\Form;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\taxonomy\Entity\Term;

/**
 * Configure custom settings for this site.
 */
class PublisherAdminForm extends ConfigFormBase {

    private $taxCount = 0;
    /**
     * Constructor for PublisherAdminForm.
     *
     * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
     * The factory for configuration objects.
     */
    public function __construct(ConfigFactoryInterface $config_factory) {
        parent::__construct($config_factory);
    }

    /**
     * Returns a unique string identifying the form.
     *
     * @return string
     * The unique string identifying the form.
     */
    public function getFormId() {
        return 'publisher_admin_form';
    }

    /**
     * Gets the configuration names that will be editable.
     *
     * @return array
     * An array of configuration object names that are editable if called in
     * conjunction with the trait's config() method.
     */
    protected function getEditableConfigNames() {
        return ['config.publisher_custom'];
    }

    /**
     * Form constructor.
     *
     * @param array $form
     * An associative array containing the structure of the form.
     * @param \Drupal\Core\Form\FormStateInterface $form_state
     * The current state of the form.
     *
     * @return array
     * The form structure.
     */
    public function buildForm(array $form, FormStateInterface $form_state)
    {

        // Publisher Name
        $form['publisher_custom']['publisher_name'] = array(
            'title' => array(
                '#type' => 'textfield',
                '#title' => t('Publisher Name'),
                '#maxlength' => 255,
                '#description' => t('Enter the name of your publisher'),
                '#required' => TRUE,
            ),
        );

        // Zeeto API Key
        $form['publisher_custom']['publisher_zeeto_key'] = array(
            'title' => array(
                '#type' => 'textfield',
                '#title' => t('Zeeto API Key'),
                '#maxlength' => 255,
                '#description' => t('Enter the API key given by Zeeto.'),
                '#required' => TRUE,
            ),
        );

//
//  Retrieved values from all taxononmies needs mod because we cannot delete a tax as is
//    if($this->init == 0){
//            // Retrieve values of Properties Vocabulary
//            $query = \Drupal::entityQuery('taxonomy_term');
//            $query->condition('vid', "property");
//            $tids = $query->execute();
//            $terms = \Drupal\taxonomy\Entity\Term::loadMultiple($tids);
//            if (count($terms) > 0) {
//               // $name_field = $form_state->set('num_names', count($terms));
//               // $num_names = count($terms);
//                }
//            $this->init = 1;
//        }
//
//        // Gather the number of names in the form already.
//        $num_names = $form_state->get('num_names');
//
//        //$num_names = count($terms);
//        // We have to ensure that there is at least one name field.
//        if ($num_names === NULL) {
//            $name_field = $form_state->set('num_names', 1);
//            $num_names = 1;
//        }
//
//        $form['#tree'] = TRUE;
//        $form['names_fieldset'] = [
//            '#type' => 'fieldset',
//            '#title' => $this->t('Property List'),
//            '#prefix' => '<div id="names-fieldset-wrapper">',
//            '#suffix' => '</div>',
//        ];
//
//        $term = '';
//        foreach($terms as $key => $term) {
//            $offset = $key;
//            break;
//        };
//        //$term[$i + $offset]->toLink()->getText()
//
//        for ($i = 0; $i < $num_names; $i++) {
//            $form['names_fieldset']['name'][$i] = [
//                '#type' => 'textfield',
//                '#default_value' => $terms[$i + $offset]->toLink()->getText(),
//                '#title' => t('Property'),
//                '#required' => TRUE,
//            ];
//        }
//
//        $form['names_fieldset']['actions'] = [
//            '#type' => 'actions',
//        ];
//        $form['names_fieldset']['actions']['add_name'] = [
//            '#type' => 'submit',
//            '#value' => t('Add one more'),
//            '#submit' => ['::addOne'],
//            '#ajax' => [
//                'callback' => '::addmoreCallback',
//                'wrapper' => 'names-fieldset-wrapper',
//            ],
//        ];
//        // If there is more than one name, add the remove button.
//        if ($num_names > 1) {
//            $form['names_fieldset']['actions']['remove_name'] = [
//                '#type' => 'submit',
//                '#value' => t('Remove one'),
//                '#submit' => ['::removeCallback'],
//                '#ajax' => [
//                    'callback' => '::addmoreCallback',
//                    'wrapper' => 'names-fieldset-wrapper',
//                ],
//            ];
//        }
//        $form_state->setCached(FALSE);

        $publisher_custom = $this->config('config.publisher_custom');
        $site_name = $this->config('system.site')->get('name');

        return parent::buildForm($form, $form_state);
    }

    /**
     * Form submission handler.
     *
     * @param array $form
     * An associative array containing the structure of the form.
     * @param \Drupal\Core\Form\FormStateInterface $form_state
     * The current state of the form.
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {


//        $categories_vocabulary = 'property'; // Vocabulary machine name
//        $propertyValues = $form_state->getValue(['names_fieldset', 'name']);
//        $categories = $propertyValues; // List of test terms
//        foreach ($categories as $category) {
//            $term = Term::create(array(
//                'parent' => array(),
//                'name' => $category,
//                'vid' => $categories_vocabulary,
//            ))->save();
//        }

        $this->config('config.publisher_custom')
            ->set('logo_title', $form_state->getValue(array('publisher_custom', 'logo', 'title')))
            ->save();

        parent::submitForm($form, $form_state);
    }

//    /**
//     * Callback for both ajax-enabled buttons.
//     *
//     * Selects and returns the fieldset with the names in it.
//     */
//    public function addmoreCallback(array &$form, FormStateInterface $form_state) {
//        $name_field = $form_state->get('num_names');
//        return $form['names_fieldset'];
//    }
//
//    /**
//     * Submit handler for the "add-one-more" button.
//     *
//     * Increments the max counter and causes a rebuild.
//     */
//    public function addOne(array &$form, FormStateInterface $form_state) {
//        $name_field = $form_state->get('num_names');
//        $add_button = $name_field + 1;
//        $form_state->set('num_names', $add_button);
//        $form_state->setRebuild();
//    }
//
//    /**
//     * Submit handler for the "remove one" button.
//     *
//     * Decrements the max counter and causes a form rebuild.
//     */
//    public function removeCallback(array &$form, FormStateInterface $form_state) {
//        $name_field = $form_state->get('num_names');
//        if ($name_field > 1) {
//            $remove_button = $name_field - 1;
//            $form_state->set('num_names', $remove_button);
//        }
//        $form_state->setRebuild();
//    }
}